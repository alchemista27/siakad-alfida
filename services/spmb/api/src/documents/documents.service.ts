import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from "@nestjs/common";
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaService } from "../prisma/prisma.service";
import { RegistrationStatus } from "../generated/prisma";
import { baseRequiredDocumentTypes, canTransition } from "../common/ppdb-workflow";
import { assertUnitAccess, type SpmbPrincipal } from "../common/spmb-scope-policy";
import {
  assertDocumentObjectKey,
  assertUploadMetadata,
  createDocumentObjectKey,
  getFileExtension,
} from "./document-upload.policy";
import { PresignUploadDto, UpsertDocumentDto } from "./documents.dto";

@Injectable()
export class DocumentsService implements OnModuleInit {
  private s3Client: S3Client | null = null;
  private readonly bucket = process.env.S3_BUCKET?.trim() || "";

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.getStorageClient();
  }

  private getStorageClient(): S3Client {
    if (this.s3Client) return this.s3Client;
    if (!this.bucket) {
      throw new ServiceUnavailableException("Penyimpanan dokumen privat belum dikonfigurasi.");
    }

    const accessKeyId = process.env.S3_ACCESS_KEY?.trim();
    const secretAccessKey = process.env.S3_SECRET_KEY?.trim();
    if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
      throw new ServiceUnavailableException("Konfigurasi kredensial penyimpanan dokumen tidak lengkap.");
    }

    this.s3Client = new S3Client({
      region: process.env.S3_REGION?.trim() || "auto",
      ...(process.env.S3_ENDPOINT?.trim() ? { endpoint: process.env.S3_ENDPOINT.trim(), forcePathStyle: true } : {}),
      ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {}),
    });
    return this.s3Client;
  }

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

  async presignUpload(userId: string, dto: PresignUploadDto) {
    assertUploadMetadata(dto);
    const registration = await this.prisma.registration.findUnique({ where: { id: dto.registrationId } });
    if (!registration) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (registration.parentId !== userId) throw new ForbiddenException("Akses ditolak.");
    this.assertUploadStage(registration.status, dto.documentType);

    const extension = getFileExtension(dto.fileName);
    const objectKey = createDocumentObjectKey(registration.id, dto.documentType, extension);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: dto.mimeType,
      ContentLength: dto.fileSize,
      Metadata: {
        "registration-id": registration.id,
        "document-type": dto.documentType,
        "file-name": encodeURIComponent(dto.fileName),
      },
    });
    const uploadUrl = await getSignedUrl(this.getStorageClient(), command, { expiresIn: 15 * 60 });
    return { uploadUrl, objectKey, expiresInSeconds: 15 * 60 };
  }

  private async assertStoredObject(dto: UpsertDocumentDto) {
    const extension = getFileExtension(dto.fileName);
    assertDocumentObjectKey(dto.registrationId, dto.documentType, dto.objectKey, extension);

    let object: { ContentType?: string; ContentLength?: number; Metadata?: Record<string, string> };
    try {
      object = await this.getStorageClient().send(new HeadObjectCommand({ Bucket: this.bucket, Key: dto.objectKey }));
    } catch {
      throw new BadRequestException("Objek dokumen privat belum tersedia.");
    }

    const metadata = object.Metadata || {};
    const fileName = metadata["file-name"] ? decodeURIComponent(metadata["file-name"]) : "";
    if (
      object.ContentType !== dto.mimeType ||
      object.ContentLength !== dto.fileSize ||
      metadata["registration-id"] !== dto.registrationId ||
      metadata["document-type"] !== dto.documentType ||
      fileName !== dto.fileName
    ) {
      throw new BadRequestException("Metadata objek dokumen tidak sesuai.");
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
    await this.assertStoredObject(dto);

    const existing = await this.prisma.document.findFirst({
      where: { registrationId: dto.registrationId, type: dto.documentType },
    });
    const documentMutation = existing
      ? this.prisma.document.update({
          where: { id: existing.id },
          data: {
            objectKey: dto.objectKey,
            fileName: dto.fileName,
            fileSize: dto.fileSize,
            mimeType: dto.mimeType,
          },
        })
      : this.prisma.document.create({
          data: {
            registrationId: dto.registrationId,
            type: dto.documentType,
            objectKey: dto.objectKey,
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
            note: "Hasil IMC/medis diunggah oleh orang tua",
          },
        }),
      ]);
      return this.documentResponse(document);
    }

    return this.documentResponse(await documentMutation);
  }

  async createSignedDownloadUrl(objectKey: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: objectKey });
    return getSignedUrl(this.getStorageClient(), command, { expiresIn: 5 * 60 });
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

    return { downloadUrl: await this.createSignedDownloadUrl(document.objectKey), expiresInSeconds: 5 * 60 };
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
          note: "Seluruh berkas persyaratan berhasil diunggah lengkap",
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
