import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SingleDecisionDto, BatchDecisionDto } from "./decisions.dto";
import { RegistrationStatus, Prisma } from "../generated/prisma";
import { canTransition } from "../common/spmb-workflow";
import { allowedUnitIds, isSuperAdmin, type SpmbPrincipal } from "../common/spmb-scope-policy";
import { buildSpmbHandoffPayload, hashSpmbHandoffPayload } from "../handoff/spmb-handoff-payload";

@Injectable()
export class DecisionsService {
  constructor(private readonly prisma: PrismaService) {}

  private assertReadPeriodAccess(period: { unitId: string }, principal: SpmbPrincipal) {
    if (isSuperAdmin(principal) || allowedUnitIds(principal, ["admin_unit", "tim_spmb"]).has(period.unitId)) return;
    throw new NotFoundException("Pendaftaran tidak ditemukan");
  }

  private assertDecisionAuthority(period: { unitId: string }, principal: SpmbPrincipal) {
    if (isSuperAdmin(principal)) return;
    if (allowedUnitIds(principal, ["admin_unit"]).has(period.unitId)) return;
    if (allowedUnitIds(principal, ["tim_spmb"]).has(period.unitId)) {
      throw new ForbiddenException("Hanya Admin Unit yang berwenang menetapkan keputusan kelulusan.");
    }
    throw new NotFoundException("Pendaftaran tidak ditemukan");
  }

  private async findScopedPeriod(periodId: string, principal: SpmbPrincipal) {
    const period = await this.prisma.admissionPeriod.findUnique({ where: { id: periodId } });
    if (!period) throw new NotFoundException("Periode pendaftaran tidak ditemukan");
    this.assertReadPeriodAccess(period, principal);
    return period;
  }

  private normalizeDecisionNote(status: RegistrationStatus, dto: { note?: string; notes?: string }) {
    const raw = (dto.note ?? dto.notes ?? "").trim();
    if (status === "rejected" && !raw) {
      throw new BadRequestException("Catatan alasan wajib diisi untuk keputusan penolakan.");
    }
    return raw || null;
  }

  private async enqueueOutboxIfAccepted(tx: any, registration: any) {
    const reactivated = tx.handoffOutbox?.updateMany
      ? await tx.handoffOutbox.updateMany({
          where: { registrationId: registration.id, status: "cancelled" },
          data: {
            status: "pending",
            attempts: 0,
            availableAt: new Date(),
            leasedAt: null,
            leaseOwner: null,
            lastError: null,
          },
        })
      : { count: 0 };
    if (reactivated.count === 1) return;
    if (!tx.handoffOutbox?.upsert) return;

    const idempotencyKey = randomUUID();
    const payload = buildSpmbHandoffPayload(registration, idempotencyKey);
    await tx.handoffOutbox.upsert({
      where: { registrationId: registration.id },
      create: {
        registrationId: registration.id,
        idempotencyKey,
        contractVersion: payload.contractVersion,
        payload,
        payloadHash: hashSpmbHandoffPayload(payload),
        status: "pending",
        attempts: 0,
      },
      update: {},
    });
  }

  private async cancelPendingHandoffForRejectedRevision(tx: any, registration: any, targetStatus: RegistrationStatus) {
    if (registration.status !== "accepted" || targetStatus !== "rejected" || !registration.handoffOutbox) return;
    if (registration.handoffStatus === "done" || registration.handoffOutbox.status === "delivered") {
      throw new BadRequestException("Keputusan tidak dapat direvisi karena data sudah diserahkan ke SIAKAD.");
    }
    if (!tx.handoffOutbox?.updateMany) {
      throw new BadRequestException("Revisi keputusan tidak tersedia karena status handoff tidak dapat diverifikasi.");
    }

    const cancelled = await tx.handoffOutbox.updateMany({
      where: {
        id: registration.handoffOutbox.id,
        status: { in: ["pending", "failed"] },
      },
      data: {
        status: "cancelled",
        leasedAt: null,
        leaseOwner: null,
        lastError: "Dibatalkan karena keputusan kelulusan direvisi menjadi tidak lulus.",
      },
    });
    if (cancelled.count !== 1) {
      throw new BadRequestException("Keputusan tidak dapat direvisi saat handoff SIAKAD sedang diproses.");
    }
  }

  async setSingleDecision(principal: SpmbPrincipal, dto: SingleDecisionDto & { notes?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where: { id: dto.registrationId },
        include: { period: true, parent: true, studentData: true, parentData: true, handoffOutbox: true },
      });
      if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan");
      this.assertDecisionAuthority(reg.period, principal);

      const prevStatus = reg.status;
      const targetStatus = dto.status as RegistrationStatus;
      if (prevStatus !== targetStatus && reg.handoffStatus === "done") {
        throw new BadRequestException("Keputusan tidak dapat direvisi karena data sudah diserahkan ke SIAKAD.");
      }
      if (prevStatus !== targetStatus && !canTransition(prevStatus, targetStatus)) {
        throw new BadRequestException("Keputusan hanya dapat ditetapkan setelah observasi selesai.");
      }
      const decisionNote = this.normalizeDecisionNote(targetStatus, dto);
      await this.cancelPendingHandoffForRejectedRevision(tx, reg, targetStatus);

      const updated = await tx.registration.update({
        where: { id: reg.id },
        data: {
          status: targetStatus,
          rejectionReason: targetStatus === "rejected" ? decisionNote : null,
          handoffStatus:
            targetStatus === "accepted" && prevStatus !== "accepted"
              ? "pending"
              : targetStatus === "rejected" && prevStatus === "accepted"
                ? "not_ready"
                : reg.handoffStatus,
        },
      });

      await tx.registrationEvent.create({
        data: {
          registrationId: reg.id,
          actorId: principal.id,
          fromStatus: prevStatus,
          toStatus: targetStatus,
          kind: "transition",
          note: decisionNote || `Keputusan kelulusan: ${targetStatus.toUpperCase()}`,
        },
      });

      if (targetStatus === "accepted" && prevStatus !== "accepted") {
        await this.enqueueOutboxIfAccepted(tx, reg);
      }

      return updated;
    });
  }

  async setBatchDecision(principal: SpmbPrincipal, dto: BatchDecisionDto & { notes?: string }) {
    if (!dto.registrationIds || dto.registrationIds.length === 0) {
      throw new BadRequestException("Daftar pendaftar tidak boleh kosong");
    }

    return this.prisma.$transaction(async (tx) => {
      const registrations = await tx.registration.findMany({
        where: { id: { in: dto.registrationIds } },
        include: { period: true, parent: true, studentData: true, parentData: true },
      });
      const registrationsById = new Map(registrations.map((registration) => [registration.id, registration]));
      const orderedRegistrations = dto.registrationIds.map((id) => registrationsById.get(id));
      if (orderedRegistrations.some((registration) => !registration)) {
        throw new NotFoundException("Pendaftaran tidak ditemukan");
      }

      const targetStatus = dto.status as RegistrationStatus;
      const decisionNote = this.normalizeDecisionNote(targetStatus, dto);

      for (const reg of orderedRegistrations) {
        this.assertDecisionAuthority(reg!.period, principal);
        if (reg!.status !== targetStatus && ["accepted", "rejected"].includes(reg!.status)) {
          throw new BadRequestException("Revisi keputusan harus dilakukan satu per satu agar riwayat dan handoff SIAKAD tetap aman.");
        }
        if (reg!.status !== targetStatus && !canTransition(reg!.status, targetStatus)) {
          throw new BadRequestException(`Pendaftar ${reg!.registrationNumber} belum selesai observasi.`);
        }
      }

      for (const reg of orderedRegistrations) {
        const registration = reg!;
        const prevStatus = registration.status;
        await tx.registration.update({
          where: { id: registration.id },
          data: {
            status: targetStatus,
            rejectionReason: targetStatus === "rejected" ? decisionNote : null,
            handoffStatus: targetStatus === "accepted" && prevStatus !== "accepted" ? "pending" : registration.handoffStatus,
          },
        });

        await tx.registrationEvent.create({
          data: {
            registrationId: registration.id,
            actorId: principal.id,
            fromStatus: prevStatus,
            toStatus: targetStatus,
            kind: "transition",
            note: decisionNote || `Keputusan kelulusan massal: ${targetStatus.toUpperCase()}`,
          },
        });

        if (targetStatus === "accepted" && prevStatus !== "accepted") {
          await this.enqueueOutboxIfAccepted(tx, registration);
        }
      }

      return {
        success: true,
        updatedCount: orderedRegistrations.length,
        status: targetStatus,
      };
    });
  }

  async getStatistics(periodId: string, principal: SpmbPrincipal) {
    await this.findScopedPeriod(periodId, principal);
    const where: Prisma.RegistrationWhereInput = { periodId };

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
