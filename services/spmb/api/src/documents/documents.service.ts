import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RegistrationStatus } from "../generated/prisma";
import { baseRequiredDocumentTypes, canTransition } from "../common/ppdb-workflow";
import { assertUnitAccess, type SpmbPrincipal } from "../common/spmb-scope-policy";
import { assertUploadMetadata } from "./document-upload.policy";
import { assertCloudinaryUploadUrl } from "./cloudinary-upload.policy";
import { UpsertDocumentDto } from "./documents.dto";

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  private assertUploadStage(status: RegistrationStatus, documentType: string) {
    const isBasicDocument = (baseRequiredDocumentTypes as readonly string[]).includes(documentType);
    const isMedicalResult = documentType === "medical_result";
    const accepted =
      (status === RegistrationStatus.documents_uploaded && isBasicDocument) ||
      (status === RegistrationStatus.medical_pending && isMedicalResult);
    if (!accepted) {
      throw new BadRequestException("Dokumen tidak dapat diunggah pada tahap pendaftaran saat ini.");
    }
  }

  private documentResponse(document: any) {
    return {
      id: document.id,
      registrationId: document.registrationId,
      type: document.type,
      fileName: document.fileName,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      createdAt: document.createdAt,
    };
  }

  async upsertDocument(userId: string, dto: UpsertDocumentDto) {
    assertUploadMetadata(dto);
    const registration = await this.prisma.registration.findUnique({ where: { id: dto.registrationId } });
    if (!registration) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (registration.parentId !== userId) throw new ForbiddenException("Akses ditolak.");
    this.assertUploadStage(registration.status, dto.documentType);
    assertCloudinaryUploadUrl(dto.fileUrl, `spmb/${registration.id}/${dto.documentType}`);

    const existing = await this.prisma.document.findFirst({
      where: { registrationId: dto.registrationId, type: dto.documentType },
    });
    const documentMutation = existing
      ? this.prisma.document.update({
          where: { id: existing.id },
          data: {
            objectKey: dto.fileUrl,
            fileName: dto.fileName,
            fileSize: dto.fileSize,
            mimeType: dto.mimeType,
          },
        })
      : this.prisma.document.create({
          data: {
            registrationId: registration.id,
            type: dto.documentType,
            objectKey: dto.fileUrl,
            fileName: dto.fileName,
            fileSize: dto.fileSize,
            mimeType: dto.mimeType,
          },
        });

    if (dto.documentType === "medical_result" && registration.status === RegistrationStatus.medical_pending) {
      const [document] = await this.prisma.$transaction([
        documentMutation,
        this.prisma.registration.update({
          where: { id: registration.id },
          data: { status: RegistrationStatus.medical_uploaded },
        }),
        this.prisma.registrationEvent.create({
          data: {
            registrationId: registration.id,
            actorId: userId,
            fromStatus: RegistrationStatus.medical_pending,
            toStatus: RegistrationStatus.medical_uploaded,
            kind: "transition",
            note: "Hasil IMC/medis Cloudinary diunggah oleh orang tua",
          },
        }),
      ]);
      return this.documentResponse(document);
    }

    return this.documentResponse(await documentMutation);
  }

  async createDownloadUrl(documentId: string, principal: SpmbPrincipal) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { registration: { include: { period: true } } },
    });
    if (!document) throw new NotFoundException("Dokumen tidak ditemukan.");

    if (document.registration.parentId !== principal.id) {
      assertUnitAccess(principal, document.registration.period.unitId, ["admin_unit", "tim_ppdb"]);
    }

    return { downloadUrl: document.objectKey };
  }

  async finalizeDocuments(registrationId: string, userId: string) {
    const registration = await this.prisma.registration.findUnique({ where: { id: registrationId } });
    if (!registration) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (registration.parentId !== userId) throw new ForbiddenException("Akses ditolak.");
    if (registration.status !== RegistrationStatus.documents_uploaded || !canTransition(registration.status, "medical_pending")) {
      throw new BadRequestException("Berkas hanya dapat difinalisasi setelah formulir orang tua lengkap.");
    }

    const documents = await this.prisma.document.findMany({ where: { registrationId } });
    const uploadedTypes = new Set(documents.map((document) => document.type));
    const missingTypes = baseRequiredDocumentTypes.filter((type) => !uploadedTypes.has(type));
    if (missingTypes.length > 0) {
      throw new BadRequestException(`Dokumen wajib belum lengkap: ${missingTypes.join(", ")}.`);
    }

    await this.prisma.$transaction([
      this.prisma.registration.update({
        where: { id: registrationId },
        data: { status: RegistrationStatus.medical_pending },
      }),
      this.prisma.registrationEvent.create({
        data: {
          registrationId,
          actorId: userId,
          fromStatus: registration.status,
          toStatus: RegistrationStatus.medical_pending,
          kind: "transition",
          note: "Seluruh berkas persyaratan Cloudinary berhasil diunggah lengkap",
        },
      }),
    ]);

    return { success: true };
  }

  async markMedicalDone(registrationId: string, userId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: { documents: true },
    });
    if (!registration) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (registration.parentId !== userId) throw new ForbiddenException("Akses ditolak.");
    if (registration.status !== RegistrationStatus.medical_uploaded || !canTransition(registration.status, "verification")) {
      throw new BadRequestException("Hasil kesehatan hanya dapat diselesaikan setelah hasil IMC diunggah.");
    }
    if (!registration.documents.some((document) => document.type === "medical_result")) {
      throw new BadRequestException("Dokumen medical_result wajib diunggah sebelum tahap verifikasi.");
    }

    await this.prisma.$transaction([
      this.prisma.registration.update({
        where: { id: registrationId },
        data: { status: RegistrationStatus.verification },
      }),
      this.prisma.registrationEvent.create({
        data: {
          registrationId,
          actorId: userId,
          fromStatus: registration.status,
          toStatus: RegistrationStatus.verification,
          kind: "transition",
          note: "Tahap pemeriksaan kesehatan selesai, berkas masuk antrean verifikasi",
        },
      }),
    ]);

    return { success: true };
  }
}
