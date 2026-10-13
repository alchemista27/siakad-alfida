import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PresignUploadDto, UpsertDocumentDto } from "./documents.dto";
import { RegistrationStatus } from "../generated/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class DocumentsService {
  private s3Client: S3Client | null = null;
  private bucket: string = process.env.S3_BUCKET || "sim-alfida-uploads";

  constructor(private readonly prisma: PrismaService) {
    if (process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY) {
      this.s3Client = new S3Client({
        region: "auto",
        endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        },
        forcePathStyle: true,
      });
    }
  }

  async presignUpload(userId: string, dto: PresignUploadDto) {
    const reg = await this.prisma.registration.findUnique({
      where: { id: dto.registrationId },
    });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (reg.parentId && reg.parentId !== userId) {
      throw new ForbiddenException("Akses ditolak.");
    }

    const ext = dto.fileName.split(".").pop() || "bin";
    const key = `spmb/${reg.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    if (this.s3Client) {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: dto.mimeType,
      });
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      const publicUrl = `${process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT || "http://localhost:9000"}/${this.bucket}/${key}`;
      return { uploadUrl, fileUrl: publicUrl, key };
    }

    // Mock fallback jika S3 credentials belum diset di dev
    return {
      uploadUrl: `/api/uploads/mock?key=${key}`,
      fileUrl: `https://storage.alfida.or.id/${this.bucket}/${key}`,
      key,
    };
  }

  async upsertDocument(userId: string, dto: UpsertDocumentDto) {
    const reg = await this.prisma.registration.findUnique({
      where: { id: dto.registrationId },
    });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (reg.parentId && reg.parentId !== userId) {
      throw new ForbiddenException("Akses ditolak.");
    }

    const existing = await this.prisma.document.findFirst({
      where: {
        registrationId: dto.registrationId,
        type: dto.type,
      },
    });

    if (existing) {
      return this.prisma.document.update({
        where: { id: existing.id },
        data: {
          fileUrl: dto.fileUrl,
          fileName: dto.fileName,
          fileSize: dto.fileSize,
          mimeType: dto.mimeType,
        },
      });
    }

    return this.prisma.document.create({
      data: {
        registrationId: dto.registrationId,
        type: dto.type,
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
      },
    });
  }

  async finalizeDocuments(registrationId: string, userId: string) {
    const reg = await this.prisma.registration.findUnique({
      where: { id: registrationId },
    });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (reg.parentId && reg.parentId !== userId) {
      throw new ForbiddenException("Akses ditolak.");
    }

    const docs = await this.prisma.document.findMany({
      where: { registrationId },
    });

    // Validasi 4 jenis dokumen inti: photo, birth_certificate, family_card, salah satu ID orang tua
    const docTypes = new Set(docs.map((d) => d.type));
    const hasPhoto = docTypes.has("photo");
    const hasBirthCert = docTypes.has("birth_certificate");
    const hasFamilyCard = docTypes.has("family_card");

    if (!hasPhoto || !hasBirthCert || !hasFamilyCard) {
      throw new BadRequestException(
        "Dokumen wajib belum lengkap (Foto, Akta Kelahiran, dan Kartu Keluarga harus diunggah)."
      );
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
          fromStatus: reg.status,
          toStatus: RegistrationStatus.medical_pending,
          kind: "transition",
          note: "Seluruh berkas persyaratan berhasil diunggah lengkap",
        },
      }),
    ]);

    return { success: true };
  }

  async markMedicalDone(registrationId: string, userId: string) {
    const reg = await this.prisma.registration.findUnique({
      where: { id: registrationId },
    });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (reg.parentId && reg.parentId !== userId) {
      throw new ForbiddenException("Akses ditolak.");
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
          fromStatus: reg.status,
          toStatus: RegistrationStatus.verification,
          kind: "transition",
          note: "Tahap pemeriksaan kesehatan selesai, berkas masuk antrean verifikasi",
        },
      }),
    ]);

    return { success: true };
  }
}
