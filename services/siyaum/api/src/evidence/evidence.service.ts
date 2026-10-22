import { BadRequestException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { canManageGroup, type YmqPrincipal } from "../ymq/ymq-access.policy";
import { AttachEvidenceDto } from "./evidence.dto";
import { validateCloudinaryEvidence } from "./ymq-cloudinary-evidence.policy";

@Injectable()
export class EvidenceService {
  constructor(private readonly prisma: PrismaService) {}

  async attach(progressId: string, dto: AttachEvidenceDto, principal: YmqPrincipal) {
    const progress = await this.prisma.ymqLearningProgress.findUnique({
      where: { id: progressId },
      include: {
        session: {
          include: { group: { include: { groupAdmins: { where: { revokedAt: null }, select: { userId: true, revokedAt: true } } } } },
        },
      },
    });
    if (!progress) throw new NotFoundException("Progress pembelajaran tidak ditemukan.");
    if (!canManageGroup(principal, progress.session.group)) {
      throw new ForbiddenException("Anda tidak ditugaskan pada kelompok bukti ini.");
    }
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    if (!cloudName) throw new ServiceUnavailableException("Cloudinary belum dikonfigurasi.");
    const checked = validateCloudinaryEvidence(dto, {
      cloudName,
      groupId: progress.session.groupId,
      sessionId: progress.sessionId,
      maxBytes: Number(process.env.YMQ_EVIDENCE_MAX_BYTES || 10_000_000),
    });
    if (!checked.valid) throw new BadRequestException("reason" in checked ? checked.reason : "Metadata bukti tidak valid.");

    const evidence = await this.prisma.ymqProgressEvidence.upsert({
      where: { progressId_cloudinaryPublicId: { progressId, cloudinaryPublicId: dto.publicId } },
      create: {
        progressId,
        cloudinaryPublicId: dto.publicId,
        secureUrl: dto.secureUrl,
        resourceType: dto.resourceType,
        originalFilename: dto.originalFilename ?? null,
        bytes: dto.bytes ?? null,
        uploadedById: principal.id,
      },
      update: {
        secureUrl: dto.secureUrl,
        resourceType: dto.resourceType,
        originalFilename: dto.originalFilename ?? null,
        bytes: dto.bytes ?? null,
        uploadedById: principal.id,
      },
    });
    return this.prisma.ymqProgressEvidence.findUniqueOrThrow({ where: { id: evidence.id } });
  }
}
