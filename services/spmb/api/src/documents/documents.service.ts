import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DocumentType, RegistrationStatus } from "../generated/prisma";
import { canTransition } from "../common/spmb-workflow";
import { requiredDocumentTypesForLevel, TkHealthFieldsSchema, type EducationLevel } from "@alfida/contracts";
import { assertUnitAccess, type SpmbPrincipal } from "../common/spmb-scope-policy";
import { assertUploadMetadata } from "./document-upload.policy";
import { assertCloudinaryUploadUrl } from "./cloudinary-upload.policy";
import { UpsertDocumentDto } from "./documents.dto";

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  private assertUploadStage(status: RegistrationStatus, documentType: string, educationLevel: EducationLevel | null | undefined) {
    const isBasicDocument = Boolean(educationLevel) && requiredDocumentTypesForLevel(educationLevel).includes(documentType);
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
    const registration = await this.prisma.registration.findUnique({ where: { id: dto.registrationId }, include: { period: true } });
    if (!registration) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (registration.parentId !== userId) throw new ForbiddenException("Akses ditolak.");
    if (!registration.period.educationLevel) throw new BadRequestException("Jenjang periode belum dikonfigurasi. Hubungi panitia SPMB.");
    this.assertUploadStage(registration.status, dto.documentType, registration.period.educationLevel);
    assertCloudinaryUploadUrl(dto.fileUrl, `spmb/${registration.id}/${dto.documentType}`);

    const existing = await this.prisma.document.findFirst({
      where: { registrationId: dto.registrationId, type: dto.documentType },
    });
    const documentMutation = existing
      ? this.prisma.document.update({
          where: { id: existing.id },
          data: {
            fileUrl: dto.fileUrl,
            fileName: dto.fileName,
            fileSize: dto.fileSize,
            mimeType: dto.mimeType,
          },
        })
      : this.prisma.document.create({
          data: {
            registrationId: registration.id,
            type: dto.documentType,
            fileUrl: dto.fileUrl,
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
      assertUnitAccess(principal, document.registration.period.unitId, ["admin_unit", "tim_spmb"]);
    }

    return { downloadUrl: document.fileUrl };
  }

  async finalizeDocuments(registrationId: string, userId: string) {
    const registration = await this.prisma.registration.findUnique({ where: { id: registrationId }, include: { period: true } });
    if (!registration) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (registration.parentId !== userId) throw new ForbiddenException("Akses ditolak.");
    if (!registration.period.educationLevel) throw new BadRequestException("Jenjang periode belum dikonfigurasi. Hubungi panitia SPMB.");
    if (registration.status !== RegistrationStatus.documents_uploaded || !canTransition(registration.status, "verification")) {
      throw new BadRequestException("Berkas hanya dapat difinalisasi setelah formulir orang tua lengkap.");
    }

    const documents = await this.prisma.document.findMany({ where: { registrationId } });
    const uploadedTypes = new Set(documents.map((document) => document.type));
    const requiredTypes = requiredDocumentTypesForLevel(registration.period.educationLevel) as readonly DocumentType[];
    const missingTypes = requiredTypes.filter((type) => !uploadedTypes.has(type));
    if (missingTypes.length > 0) {
      throw new BadRequestException(`Dokumen wajib belum lengkap: ${missingTypes.join(", ")}.`);
    }

    await this.prisma.$transaction([
      this.prisma.registration.update({
        where: { id: registrationId },
        data: {
          status: RegistrationStatus.verification,
          dossierReviewStatus: "pending",
          rejectionReason: null,
        },
      }),
      this.prisma.registrationEvent.create({
        data: {
          registrationId,
          actorId: userId,
          fromStatus: registration.status,
          toStatus: RegistrationStatus.verification,
          kind: "transition",
          note: "Seluruh berkas persyaratan diunggah lengkap dan masuk antrean verifikasi berkas panitia",
        },
      }),
    ]);

    return { success: true };
  }

  async markMedicalDone(registrationId: string, userId: string, healthInput?: unknown) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: { documents: true, period: true },
    });
    if (!registration) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (registration.parentId !== userId) throw new ForbiddenException("Akses ditolak.");
    if (registration.status !== RegistrationStatus.medical_uploaded || !canTransition(registration.status, "verification")) {
      throw new BadRequestException("Hasil kesehatan hanya dapat diselesaikan setelah hasil IMC diunggah.");
    }
    if (!registration.documents.some((document) => document.type === "medical_result")) {
      throw new BadRequestException("Dokumen medical_result wajib diunggah sebelum tahap verifikasi.");
    }

    const isTk = registration.period.educationLevel === "tk";
    const health = TkHealthFieldsSchema.safeParse(healthInput || {});
    if (isTk && !health.success) {
      throw new BadRequestException(health.error.issues[0]?.message || "Data kesehatan TK belum lengkap.");
    }
    if (!isTk && health.success && Object.keys(healthInput as object || {}).length > 0) {
      throw new BadRequestException("Data kesehatan terstruktur hanya diisi untuk pendaftar TK.");
    }

    const mutations: any[] = [
      this.prisma.registration.update({
        where: { id: registrationId },
        data: {
          status: RegistrationStatus.verification,
          dossierReviewStatus: "pending",
          rejectionReason: null,
        },
      }),
      this.prisma.registrationEvent.create({
        data: {
          registrationId,
          actorId: userId,
          fromStatus: registration.status,
          toStatus: RegistrationStatus.verification,
          kind: "transition",
          note: "Tahap pemeriksaan kesehatan selesai, hasil kesehatan masuk antrean verifikasi panitia",
        },
      }),
    ];
    if (isTk && health.success) {
      mutations.unshift(this.prisma.studentData.update({
        where: { registrationId },
        data: health.data,
      }));
    }
    await this.prisma.$transaction(mutations);
    return { success: true };
  }
}
