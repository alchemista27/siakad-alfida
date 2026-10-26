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
import { randomUUID } from "crypto";
import { PaymentStatus, RegistrationStatus } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { assertUnitAccess, type SpmbPrincipal } from "../common/spmb-scope-policy";
import { ACCEPTED_UPLOADS, getFileExtension } from "../documents/document-upload.policy";

export type PaymentProofUploadMetadata = {
  fileName: string;
  mimeType: string;
  fileSize: number;
};

export type FinalizePaymentProofUploadDto = PaymentProofUploadMetadata & {
  objectKey: string;
};

@Injectable()
export class PaymentProofStorageService implements OnModuleInit {
  private s3Client: S3Client | null = null;
  private readonly bucket = process.env.S3_BUCKET?.trim() || "";

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.getStorageClient();
  }

  private getStorageClient(): S3Client {
    if (this.s3Client) return this.s3Client;
    if (!this.bucket) {
      throw new ServiceUnavailableException("Penyimpanan bukti pembayaran privat belum dikonfigurasi.");
    }

    const accessKeyId = process.env.S3_ACCESS_KEY?.trim();
    const secretAccessKey = process.env.S3_SECRET_KEY?.trim();
    if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
      throw new ServiceUnavailableException("Konfigurasi kredensial penyimpanan bukti pembayaran tidak lengkap.");
    }

    this.s3Client = new S3Client({
      region: process.env.S3_REGION?.trim() || "auto",
      ...(process.env.S3_ENDPOINT?.trim() ? { endpoint: process.env.S3_ENDPOINT.trim(), forcePathStyle: true } : {}),
      ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {}),
    });
    return this.s3Client;
  }

  private assertMetadata(metadata: PaymentProofUploadMetadata) {
    const accepted = ACCEPTED_UPLOADS[metadata.mimeType as keyof typeof ACCEPTED_UPLOADS];
    if (!accepted) throw new BadRequestException("Tipe MIME bukti pembayaran tidak diizinkan.");

    const extension = getFileExtension(metadata.fileName);
    if (!(accepted.extensions as readonly string[]).includes(extension)) {
      throw new BadRequestException("Ekstensi bukti pembayaran tidak sesuai dengan tipe MIME.");
    }
    if (!Number.isSafeInteger(metadata.fileSize) || metadata.fileSize <= 0 || metadata.fileSize > accepted.maxBytes) {
      throw new BadRequestException("Ukuran bukti pembayaran tidak diizinkan.");
    }
  }

  private createObjectKey(registrationId: string, extension: string) {
    return `spmb/${registrationId}/payment-proof/${randomUUID()}.${extension}`;
  }

  private assertObjectKey(registrationId: string, objectKey: string, extension: string) {
    const escapedRegistrationId = registrationId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedExtension = extension.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const expected = new RegExp(
      `^spmb/${escapedRegistrationId}/payment-proof/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.${escapedExtension}$`,
    );
    if (!expected.test(objectKey)) throw new BadRequestException("Kunci objek bukti pembayaran tidak valid.");
  }

  private async findRegistration(registrationId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: { period: true, payment: true },
    });
    if (!registration) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    return registration;
  }

  private assertParent(registration: { parentId: string | null }, parentId: string) {
    if (registration.parentId !== parentId) throw new ForbiddenException("Akses ditolak.");
  }

  private assertUploadStage(registration: { status: RegistrationStatus }) {
    if (registration.status !== RegistrationStatus.pending_payment) {
      throw new BadRequestException("Tahap pendaftaran saat ini tidak dapat mengunggah bukti pembayaran.");
    }
  }

  async presignUpload(registrationId: string, parentId: string, metadata: PaymentProofUploadMetadata) {
    this.assertMetadata(metadata);
    const registration = await this.findRegistration(registrationId);
    this.assertParent(registration, parentId);
    this.assertUploadStage(registration);

    const extension = getFileExtension(metadata.fileName);
    const objectKey = this.createObjectKey(registrationId, extension);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: metadata.mimeType,
      ContentLength: metadata.fileSize,
      Metadata: {
        "registration-id": registrationId,
        "payment-proof": "true",
        "file-name": encodeURIComponent(metadata.fileName),
      },
    });
    return {
      uploadUrl: await getSignedUrl(this.getStorageClient(), command, { expiresIn: 15 * 60 }),
      objectKey,
      expiresInSeconds: 15 * 60,
    };
  }

  private async assertStoredObject(registrationId: string, dto: FinalizePaymentProofUploadDto) {
    const extension = getFileExtension(dto.fileName);
    this.assertObjectKey(registrationId, dto.objectKey, extension);

    let object: { ContentType?: string; ContentLength?: number; Metadata?: Record<string, string> };
    try {
      object = await this.getStorageClient().send(new HeadObjectCommand({ Bucket: this.bucket, Key: dto.objectKey }));
    } catch {
      throw new BadRequestException("Objek bukti pembayaran privat belum tersedia.");
    }

    const metadata = object.Metadata || {};
    const fileName = metadata["file-name"] ? decodeURIComponent(metadata["file-name"]) : "";
    if (
      object.ContentType !== dto.mimeType
      || object.ContentLength !== dto.fileSize
      || metadata["registration-id"] !== registrationId
      || metadata["payment-proof"] !== "true"
      || fileName !== dto.fileName
    ) {
      throw new BadRequestException("Metadata objek bukti pembayaran tidak sesuai.");
    }
  }

  async finalizeUpload(registrationId: string, parentId: string, dto: FinalizePaymentProofUploadDto) {
    this.assertMetadata(dto);
    const registration = await this.findRegistration(registrationId);
    this.assertParent(registration, parentId);
    this.assertUploadStage(registration);
    await this.assertStoredObject(registrationId, dto);

    await this.prisma.$transaction([
      this.prisma.payment.upsert({
        where: { registrationId },
        update: {
          proofUrl: null,
          proofObjectKey: dto.objectKey,
          proofFileName: dto.fileName,
          proofFileSize: dto.fileSize,
          proofMimeType: dto.mimeType,
          amount: registration.payment?.amount ?? registration.period.fee,
          status: PaymentStatus.uploaded,
          uploadedAt: new Date(),
        },
        create: {
          registrationId,
          proofUrl: null,
          proofObjectKey: dto.objectKey,
          proofFileName: dto.fileName,
          proofFileSize: dto.fileSize,
          proofMimeType: dto.mimeType,
          amount: registration.period.fee,
          status: PaymentStatus.uploaded,
          uploadedAt: new Date(),
        },
      }),
      this.prisma.registration.update({
        where: { id: registrationId },
        data: { status: RegistrationStatus.payment_uploaded },
      }),
      this.prisma.registrationEvent.create({
        data: {
          registrationId,
          actorId: parentId,
          fromStatus: registration.status,
          toStatus: RegistrationStatus.payment_uploaded,
          kind: "transition",
          note: "Bukti transfer diunggah oleh pendaftar",
        },
      }),
    ]);

    return { success: true };
  }

  async createSignedDownloadUrl(objectKey: string) {
    return getSignedUrl(
      this.getStorageClient(),
      new GetObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      { expiresIn: 5 * 60 },
    );
  }

  async createDownloadUrl(registrationId: string, principal: SpmbPrincipal) {
    const registration = await this.findRegistration(registrationId);
    const objectKey = registration.payment?.proofObjectKey;
    if (!objectKey) throw new NotFoundException("Bukti pembayaran privat belum tersedia.");

    if (registration.parentId !== principal.id) {
      assertUnitAccess(principal, registration.period.unitId, ["admin_unit", "tim_ppdb"]);
    }

    return { downloadUrl: await this.createSignedDownloadUrl(objectKey), expiresInSeconds: 5 * 60 };
  }
}
