import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PaymentStatus, RegistrationStatus } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { assertUnitAccess, type SpmbPrincipal } from "../common/spmb-scope-policy";
import { ACCEPTED_UPLOADS, getFileExtension } from "../documents/document-upload.policy";
import { assertCloudinaryUploadUrl } from "../documents/cloudinary-upload.policy";

export type PaymentProofCloudinaryUploadDto = {
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

@Injectable()
export class PaymentProofCloudinaryService {
  constructor(private readonly prisma: PrismaService) {}

  private assertMetadata(metadata: PaymentProofCloudinaryUploadDto) {
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

  async recordUpload(registrationId: string, parentId: string, dto: PaymentProofCloudinaryUploadDto) {
    this.assertMetadata(dto);
    assertCloudinaryUploadUrl(dto.fileUrl, `spmb/${registrationId}/payment-proof`);
    const registration = await this.findRegistration(registrationId);
    this.assertParent(registration, parentId);
    this.assertUploadStage(registration);

    await this.prisma.$transaction([
      this.prisma.payment.upsert({
        where: { registrationId },
        update: {
          proofUrl: dto.fileUrl,
          proofObjectKey: null,
          proofFileName: dto.fileName,
          proofFileSize: dto.fileSize,
          proofMimeType: dto.mimeType,
          amount: registration.payment?.amount ?? registration.period.fee,
          status: PaymentStatus.uploaded,
          uploadedAt: new Date(),
        },
        create: {
          registrationId,
          proofUrl: dto.fileUrl,
          proofObjectKey: null,
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
          note: "Bukti transfer Cloudinary diunggah oleh pendaftar",
        },
      }),
    ]);

    return { success: true };
  }

  async createDownloadUrl(registrationId: string, principal: SpmbPrincipal) {
    const registration = await this.findRegistration(registrationId);
    const fileUrl = registration.payment?.proofUrl;
    if (!fileUrl) throw new NotFoundException("Bukti pembayaran Cloudinary belum tersedia.");

    if (registration.parentId !== principal.id) {
      assertUnitAccess(principal, registration.period.unitId, ["admin_unit", "tim_spmb"]);
    }

    return { downloadUrl: fileUrl };
  }
}
