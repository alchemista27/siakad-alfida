import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SingleDecisionDto, BatchDecisionDto } from "./decisions.dto";
import { RegistrationStatus, Prisma } from "../generated/prisma";

@Injectable()
export class DecisionsService {
  constructor(private readonly prisma: PrismaService) {}

  async setSingleDecision(actorId: string, dto: SingleDecisionDto) {
    return this.prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where: { id: dto.registrationId },
      });
      if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan");

      const prevStatus = reg.status;
      const targetStatus = dto.status as RegistrationStatus;

      const updated = await tx.registration.update({
        where: { id: reg.id },
        data: {
          status: targetStatus,
          handoffStatus: targetStatus === "accepted" ? "pending" : reg.handoffStatus,
        },
      });

      await tx.registrationEvent.create({
        data: {
          registrationId: reg.id,
          actorId,
          fromStatus: prevStatus,
          toStatus: targetStatus,
          kind: "transition",
          note: dto.note || `Keputusan kelulusan: ${targetStatus.toUpperCase()}`,
        },
      });

      return updated;
    });
  }

  async setBatchDecision(actorId: string, dto: BatchDecisionDto) {
    if (!dto.registrationIds || dto.registrationIds.length === 0) {
      throw new BadRequestException("Daftar pendaftar tidak boleh kosong");
    }

    return this.prisma.$transaction(async (tx) => {
      const targetStatus = dto.status as RegistrationStatus;
      let count = 0;

      for (const regId of dto.registrationIds) {
        const reg = await tx.registration.findUnique({ where: { id: regId } });
        if (!reg) continue;

        const prevStatus = reg.status;
        await tx.registration.update({
          where: { id: reg.id },
          data: {
            status: targetStatus,
            handoffStatus: targetStatus === "accepted" ? "pending" : reg.handoffStatus,
          },
        });

        await tx.registrationEvent.create({
          data: {
            registrationId: reg.id,
            actorId,
            fromStatus: prevStatus,
            toStatus: targetStatus,
            kind: "transition",
            note: dto.note || `Keputusan kelulusan massal: ${targetStatus.toUpperCase()}`,
          },
        });

        count++;
      }

      return {
        success: true,
        updatedCount: count,
        status: targetStatus,
      };
    });
  }

  async getStatistics(periodId: string, unitId?: string) {
    const where: Prisma.RegistrationWhereInput = {
      periodId,
      ...(unitId ? { period: { unitId } } : {}),
    };

    const registrations = await this.prisma.registration.findMany({
      where,
      select: {
        status: true,
        source: true,
        handoffStatus: true,
      },
    });

    const statusCounts: Record<string, number> = {};
    let onlineCount = 0;
    let offlineCount = 0;
    let handedOffCount = 0;

    for (const reg of registrations) {
      statusCounts[reg.status] = (statusCounts[reg.status] || 0) + 1;
      if (reg.source === "offline") offlineCount++;
      else onlineCount++;

      if (reg.handoffStatus === "done") handedOffCount++;
    }

    return {
      total: registrations.length,
      onlineCount,
      offlineCount,
      handedOffCount,
      byStatus: statusCounts,
      acceptedCount: statusCounts["accepted"] || 0,
      rejectedCount: statusCounts["rejected"] || 0,
      observationDoneCount: statusCounts["observation_done"] || 0,
      pendingVerificationCount: statusCounts["verification"] || 0,
    };
  }
}
