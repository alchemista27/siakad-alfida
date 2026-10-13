import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SyncHandoffDto, BatchSyncHandoffDto } from "./handoff.dto";
import { HandoffStatus, Prisma } from "../generated/prisma";

@Injectable()
export class HandoffService {
  private readonly logger = new Logger(HandoffService.name);

  constructor(private readonly prisma: PrismaService) {}

  async syncSingle(actorId: string, dto: SyncHandoffDto) {
    const reg = await this.prisma.registration.findUnique({
      where: { id: dto.registrationId },
      include: {
        parent: true,
        studentData: true,
        parentData: true,
        period: true,
      },
    });

    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan");
    if (reg.status !== "accepted") {
      throw new BadRequestException("Hanya pendaftar berstatus 'accepted' yang dapat diserahkan ke SIAKAD");
    }

    const payload = {
      spmbRegistrationId: reg.id,
      registrationNumber: reg.registrationNumber,
      academicYear: reg.period.label,
      unitId: reg.period.unitId,
      user: reg.parent
        ? {
            id: reg.parent.id,
            name: reg.parent.fullName,
            email: reg.parent.email,
            phone: reg.parent.phone,
          }
        : {
            name: reg.guardianName,
            email: reg.guardianEmail,
            phone: reg.guardianPhone,
          },
      student: reg.studentData
        ? {
            id: reg.studentData.id,
            fullName: reg.studentData.fullName,
            nickname: reg.studentData.nickname,
            gender: reg.studentData.gender,
            birthPlace: reg.studentData.birthPlace,
            birthDate: reg.studentData.birthDate.toISOString(),
            nisn: reg.studentData.nisn,
            address: reg.studentData.address,
          }
        : null,
      parents: reg.parentData.map((p) => ({
        id: p.id,
        type: p.type,
        fullName: p.fullName,
        nik: p.nik,
        phone: p.phone,
        education: p.education,
        occupation: p.occupation,
        incomeRange: p.incomeRange,
      })),
    };

    const targetUrl = `${process.env.INTERNAL_SIAKAD_API_URL || "http://localhost:4000"}/api/internal/spmb-handoff`;
    const secretKey = process.env.INTERNAL_SERVICE_SECRET || "simalfida-internal-secret-2026";

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-service-key": secretKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Handoff failed for ${reg.registrationNumber}: ${errorText}`);
        await this.prisma.registration.update({
          where: { id: reg.id },
          data: { handoffStatus: HandoffStatus.failed, handoffError: errorText },
        });
        return {
          success: false,
          registrationId: reg.id,
          message: `Gagal mengirim data ke SIAKAD (${response.status}): ${errorText}`,
        };
      }

      await this.prisma.registration.update({
        where: { id: reg.id },
        data: {
          handoffStatus: HandoffStatus.done,
          handoffAt: new Date(),
          handoffError: null,
        },
      });

      await this.prisma.registrationEvent.create({
        data: {
          registrationId: reg.id,
          actorId,
          fromStatus: reg.status,
          toStatus: reg.status,
          kind: "handoff",
          note: `Data pendaftar berhasil disinkronisasi ke SIAKAD (${reg.period.label})`,
        },
      });

      return {
        success: true,
        registrationId: reg.id,
        registrationNumber: reg.registrationNumber,
        message: "Data pendaftar berhasil disinkronkan ke SIAKAD",
      };
    } catch (err: any) {
      this.logger.error(`Network error during handoff for ${reg.registrationNumber}`, err);
      await this.prisma.registration.update({
        where: { id: reg.id },
        data: { handoffStatus: HandoffStatus.failed, handoffError: err.message },
      });
      return {
        success: false,
        registrationId: reg.id,
        message: `Koneksi ke endpoint SIAKAD gagal: ${err.message}`,
      };
    }
  }

  async syncBatch(actorId: string, dto: BatchSyncHandoffDto) {
    const results = [];
    for (const regId of dto.registrationIds) {
      const res = await this.syncSingle(actorId, { registrationId: regId });
      results.push(res);
    }
    const successCount = results.filter((r) => r.success).length;
    return {
      total: dto.registrationIds.length,
      successCount,
      failedCount: dto.registrationIds.length - successCount,
      details: results,
    };
  }

  async listHandoffStatus(periodId: string, unitId?: string) {
    const where: Prisma.RegistrationWhereInput = {
      periodId,
      status: "accepted",
      ...(unitId ? { period: { unitId } } : {}),
    };

    return this.prisma.registration.findMany({
      where,
      select: {
        id: true,
        registrationNumber: true,
        handoffStatus: true,
        handoffError: true,
        handoffAt: true,
        source: true,
        period: {
          select: {
            unitId: true,
            label: true,
          },
        },
        studentData: {
          select: {
            fullName: true,
            gender: true,
            nisn: true,
          },
        },
        parent: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
        guardianName: true,
        guardianPhone: true,
      },
      orderBy: { registrationNumber: "asc" },
    });
  }
}
