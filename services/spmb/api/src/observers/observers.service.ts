import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { allowedUnitIds, assertUnitAccess, isSuperAdmin, type SpmbPrincipal } from "../common/spmb-scope-policy";
import { canTransition } from "../common/spmb-workflow";
import { rankObservationResults } from "../observations/ranking.policy";
import { AssignObserverDto, SubmitMyObservationResultDto } from "./observers.dto";
import { SimpegObserverCandidateClient } from "./simpeg-observer-candidate.client";
import { SpmbObserverRoleBrokerClient } from "./spmb-observer-role-broker.client";

const observerRoles = ["admin_unit", "tim_spmb", "observer"] as const;
const serializable = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable } as const;

@Injectable()
export class ObserversService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly simpegObserverCandidates: SimpegObserverCandidateClient,
    private readonly observerRoles: SpmbObserverRoleBrokerClient,
  ) {}

  private assertExistingPeriodAccess(period: { unitId: string }, principal: SpmbPrincipal) {
    if (isSuperAdmin(principal) || allowedUnitIds(principal, observerRoles).has(period.unitId)) return;
    throw new NotFoundException("Data observer tidak ditemukan");
  }

  private async findScopedPeriod(periodId: string, principal: SpmbPrincipal) {
    const period = await this.prisma.admissionPeriod.findUnique({ where: { id: periodId } });
    if (!period) throw new NotFoundException("Periode pendaftaran tidak ditemukan");
    this.assertExistingPeriodAccess(period, principal);
    return period;
  }

  private async assertActiveMembership(client: { spmbObserver: { findFirst: (args: unknown) => Promise<unknown> } }, principal: SpmbPrincipal, unitId: string) {
    const membership = await client.spmbObserver.findFirst({
      where: { userId: principal.id, unitId, isActive: true },
    });
    if (!membership) throw new ForbiddenException("Anda bukan observer aktif untuk unit pendaftar ini.");
    return membership;
  }

  async list(principal: SpmbPrincipal, periodId: string) {
    const period = await this.findScopedPeriod(periodId, principal);
    return this.prisma.spmbObserver.findMany({
      where: { unitId: period.unitId },
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }, { id: "asc" }],
    });
  }

  async listCandidates(principal: SpmbPrincipal, unitId: string, search: string) {
    assertUnitAccess(principal, unitId, ["admin_unit"]);
    return this.simpegObserverCandidates.findCandidates(unitId, search);
  }

  async assign(principal: SpmbPrincipal, dto: AssignObserverDto) {
    assertUnitAccess(principal, dto.unitId, ["admin_unit"]);
    await this.simpegObserverCandidates.assertCurrentUnitEmployee(dto.unitId, dto.userId);
    const previous = await this.prisma.spmbObserver.findUnique({
      where: { unitId_userId: { unitId: dto.unitId, userId: dto.userId } },
    });
    const assignment = await this.prisma.spmbObserver.upsert({
      where: { unitId_userId: { unitId: dto.unitId, userId: dto.userId } },
      create: { unitId: dto.unitId, userId: dto.userId, isActive: true },
      update: { isActive: true },
    });
    try {
      await this.observerRoles.grant(dto.unitId, dto.userId);
      return assignment;
    } catch (error) {
      if (previous) {
        await this.prisma.spmbObserver.update({ where: { id: previous.id }, data: { isActive: previous.isActive } });
      } else {
        await this.prisma.spmbObserver.delete({ where: { id: assignment.id } });
      }
      throw error;
    }
  }

  async deactivate(principal: SpmbPrincipal, userId: string, unitId: string) {
    const assignment = await this.prisma.spmbObserver.findUnique({
      where: { unitId_userId: { unitId, userId } },
    });
    if (!assignment) throw new NotFoundException("Data observer tidak ditemukan");
    if (!isSuperAdmin(principal) && !allowedUnitIds(principal, ["admin_unit"]).has(assignment.unitId)) {
      throw new NotFoundException("Data observer tidak ditemukan");
    }
    const deactivated = await this.prisma.spmbObserver.update({ where: { id: assignment.id }, data: { isActive: false } });
    try {
      await this.observerRoles.revoke(unitId, userId);
      return deactivated;
    } catch (error) {
      await this.prisma.spmbObserver.update({ where: { id: assignment.id }, data: { isActive: true } });
      throw error;
    }
  }

  async getMyWorklist(principal: SpmbPrincipal, periodId: string) {
    const period = await this.findScopedPeriod(periodId, principal);
    await this.assertActiveMembership(this.prisma, principal, period.unitId);
    return this.prisma.registration.findMany({
      where: {
        periodId: period.id,
        status: "observation_scheduled",
        observationBooking: { isNot: null },
      },
      include: {
        studentData: true,
        observationBooking: { include: { schedule: true } },
        observationResult: true,
      },
      orderBy: { registrationNumber: "asc" },
    });
  }

  async getMyRankings(principal: SpmbPrincipal, periodId: string) {
    const period = await this.findScopedPeriod(periodId, principal);
    await this.assertActiveMembership(this.prisma, principal, period.unitId);
    const registrations = await this.prisma.registration.findMany({
      where: { periodId: period.id, status: { in: ["observation_done", "accepted", "rejected"] } },
      include: { studentData: true, observationResult: true },
    });

    return rankObservationResults(registrations).map(({ registration, rank }) => ({
      rank,
      registrationId: registration.id,
      registrationNumber: registration.registrationNumber,
      studentName: registration.studentData?.fullName || "Belum ada nama",
      score: Number(registration.observationResult.score),
      notes: registration.observationResult.notes || null,
      status: registration.status,
    }));
  }

  async submitMyResult(principal: SpmbPrincipal, dto: SubmitMyObservationResultDto) {
    return this.prisma.$transaction(async (tx) => {
      const registration = await tx.registration.findUnique({
        where: { id: dto.registrationId },
        include: { period: true, observationBooking: true },
      });
      if (!registration) throw new NotFoundException("Pendaftaran tidak ditemukan");
      this.assertExistingPeriodAccess(registration.period, principal);
      await this.assertActiveMembership(tx, principal, registration.period.unitId);

      if (!registration.observationBooking) {
        throw new BadRequestException("Hasil observasi hanya dapat diinput untuk pendaftar yang memiliki jadwal observasi.");
      }
      if (!canTransition(registration.status, "observation_done")) {
        throw new BadRequestException("Hasil observasi hanya dapat diinput untuk pendaftar yang sudah menjadwalkan observasi.");
      }
      if (dto.score < 0 || dto.score > 100) {
        throw new BadRequestException("Nilai observasi harus berada di rentang 0 sampai 100");
      }

      const result = await tx.observationResult.upsert({
        where: { registrationId: registration.id },
        create: {
          registrationId: registration.id,
          observerId: principal.id,
          score: new Prisma.Decimal(dto.score),
          notes: dto.notes,
        },
        update: { observerId: principal.id, score: new Prisma.Decimal(dto.score), notes: dto.notes },
      });
      await tx.registration.update({ where: { id: registration.id }, data: { status: "observation_done" } });
      await tx.registrationEvent.create({
        data: {
          registrationId: registration.id,
          actorId: principal.id,
          fromStatus: registration.status,
          toStatus: "observation_done",
          kind: registration.source === "offline" ? "backfill" : "transition",
          note: `Hasil observasi diinput dengan nilai ${dto.score}. ${dto.notes ? `Catatan: ${dto.notes}` : ""}`,
        },
      });
      return result;
    }, serializable);
  }
}
