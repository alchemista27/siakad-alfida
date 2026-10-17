import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  BookScheduleDto,
  SubmitObservationResultDto,
} from "./observations.dto";
import { Prisma } from "../generated/prisma";
import { canTransition } from "../common/ppdb-workflow";
import { allowedUnitIds, isSuperAdmin, type SpmbPrincipal } from "../common/spmb-scope-policy";
import { rankObservationResults } from "./ranking.policy";

const scheduleStaffRoles = ["admin_unit", "tim_ppdb", "observer"] as const;
const serializable = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable } as const;

@Injectable()
export class ObservationsService {
  constructor(private readonly prisma: PrismaService) {}

  private assertExistingPeriodAccess(period: { unitId: string }, principal: SpmbPrincipal) {
    if (isSuperAdmin(principal) || allowedUnitIds(principal, scheduleStaffRoles).has(period.unitId)) return;
    throw new NotFoundException("Data observasi tidak ditemukan");
  }

  private async findScopedPeriod(periodId: string, principal: SpmbPrincipal) {
    const period = await this.prisma.admissionPeriod.findUnique({ where: { id: periodId } });
    if (!period) throw new NotFoundException("Periode pendaftaran tidak ditemukan");
    this.assertExistingPeriodAccess(period, principal);
    return period;
  }

  private isDossierApproved(registration: { dossierReviewStatus: string }) {
    return registration.dossierReviewStatus === "approved";
  }

  async createSchedule(dto: CreateScheduleDto, principal: SpmbPrincipal) {
    await this.findScopedPeriod(dto.periodId, principal);
    return this.prisma.observationSchedule.create({
      data: {
        periodId: dto.periodId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        quota: dto.quota,
        booked: 0,
      },
    });
  }

  async listSchedules(periodId: string) {
    return this.prisma.observationSchedule.findMany({
      where: { periodId },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      include: { _count: { select: { bookings: true } } },
    });
  }

  async updateSchedule(id: string, dto: UpdateScheduleDto, principal: SpmbPrincipal) {
    const schedule = await this.prisma.observationSchedule.findUnique({
      where: { id },
      include: { period: true, _count: { select: { bookings: true } } },
    });
    if (!schedule) throw new NotFoundException("Jadwal tidak ditemukan");
    this.assertExistingPeriodAccess(schedule.period, principal);

    const booked = Math.max(schedule.booked, schedule._count.bookings);
    if (dto.quota !== undefined && dto.quota < booked) {
      throw new BadRequestException("Kuota jadwal tidak boleh lebih kecil dari jumlah peserta yang sudah terdaftar");
    }

    return this.prisma.observationSchedule.update({
      where: { id },
      data: {
        date: dto.date === undefined ? undefined : new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        quota: dto.quota,
      },
    });
  }

  async deleteSchedule(id: string, principal: SpmbPrincipal) {
    return this.prisma.$transaction(async (tx) => {
      const schedule = await tx.observationSchedule.findUnique({
        where: { id },
        include: { period: true, _count: { select: { bookings: true } } },
      });
      if (!schedule) throw new NotFoundException("Jadwal tidak ditemukan");
      this.assertExistingPeriodAccess(schedule.period, principal);
      if (schedule._count.bookings > 0) {
        throw new BadRequestException("Jadwal tidak dapat dihapus karena sudah ada peserta yang terdaftar");
      }

      const deleted = await tx.observationSchedule.deleteMany({
        where: { id, bookings: { none: {} } },
      });
      if (deleted.count !== 1) {
        throw new BadRequestException("Jadwal tidak dapat dihapus karena sudah ada peserta yang terdaftar");
      }
      return schedule;
    }, serializable);
  }

  async bookSchedule(actorId: string, dto: BookScheduleDto) {
    return this.prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where: { id: dto.registrationId },
        include: { observationBooking: true },
      });
      if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan");
      if (reg.parentId !== actorId) {
        throw new BadRequestException("Anda tidak berhak mengatur jadwal pendaftaran ini");
      }
      if (reg.status !== "verification" && reg.status !== "observation_scheduled") {
        throw new BadRequestException("Jadwal observasi baru dapat dipilih setelah berkas diverifikasi panitia");
      }
      if (!this.isDossierApproved(reg as typeof reg & Record<string, unknown>)) {
        throw new BadRequestException("Berkas masih menunggu verifikasi panitia");
      }

      const targetSchedule = await tx.observationSchedule.findUnique({ where: { id: dto.observationScheduleId } });
      if (!targetSchedule) throw new NotFoundException("Jadwal observasi tidak ditemukan");
      if (targetSchedule.periodId !== reg.periodId) {
        throw new BadRequestException("Jadwal observasi harus berasal dari periode pendaftaran yang sama.");
      }
      if (reg.observationBooking?.observationScheduleId === dto.observationScheduleId) {
        return reg.observationBooking;
      }

      const reserved = await tx.observationSchedule.updateMany({
        where: {
          id: dto.observationScheduleId,
          periodId: reg.periodId,
          booked: { lt: targetSchedule.quota },
        },
        data: { booked: { increment: 1 } },
      });
      if (reserved.count !== 1) {
        throw new BadRequestException("Slot jadwal observasi sudah penuh");
      }

      if (reg.observationBooking) {
        await tx.observationSchedule.update({
          where: { id: reg.observationBooking.observationScheduleId },
          data: { booked: { decrement: 1 } },
        });
        await tx.observationBooking.update({
          where: { id: reg.observationBooking.id },
          data: { observationScheduleId: dto.observationScheduleId },
        });
      } else {
        await tx.observationBooking.create({
          data: { registrationId: dto.registrationId, observationScheduleId: dto.observationScheduleId },
        });
      }

      if (canTransition(reg.status, "observation_scheduled")) {
        await tx.registration.update({ where: { id: reg.id }, data: { status: "observation_scheduled" } });
        await tx.registrationEvent.create({
          data: {
            registrationId: reg.id,
            actorId,
            fromStatus: reg.status,
            toStatus: "observation_scheduled",
            kind: "transition",
            note: `Memilih jadwal observasi pada ${targetSchedule.date.toISOString().slice(0, 10)} jam ${targetSchedule.startTime}`,
          },
        });
      }

      return { success: true, message: "Jadwal observasi berhasil dipilih" };
    }, serializable);
  }

  async submitResult(principal: SpmbPrincipal, dto: SubmitObservationResultDto) {
    return this.prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where: { id: dto.registrationId },
        include: { period: true, observationBooking: true },
      });
      if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan");
      this.assertExistingPeriodAccess(reg.period, principal);

      const assignment = await tx.spmbObserver.findFirst({
        where: { userId: principal.id, unitId: reg.period.unitId, isActive: true },
      });
      if (!assignment) throw new ForbiddenException("Anda bukan observer aktif untuk unit pendaftar ini.");
      if (!reg.observationBooking) {
        throw new BadRequestException("Hasil observasi hanya dapat diinput untuk pendaftar yang memiliki jadwal observasi.");
      }
      if (!canTransition(reg.status, "observation_done")) {
        throw new BadRequestException("Hasil observasi hanya dapat diinput untuk pendaftar yang sudah menjadwalkan observasi.");
      }
      if (dto.score < 0 || dto.score > 100) {
        throw new BadRequestException("Nilai observasi harus berada di rentang 0 sampai 100");
      }

      const result = await tx.observationResult.upsert({
        where: { registrationId: dto.registrationId },
        create: {
          registrationId: dto.registrationId,
          observerId: principal.id,
          score: new Prisma.Decimal(dto.score),
          notes: dto.notes,
        },
        update: { observerId: principal.id, score: new Prisma.Decimal(dto.score), notes: dto.notes },
      });

      await tx.registration.update({ where: { id: reg.id }, data: { status: "observation_done" } });
      await tx.registrationEvent.create({
        data: {
          registrationId: reg.id,
          actorId: principal.id,
          fromStatus: reg.status,
          toStatus: "observation_done",
          kind: reg.source === "offline" ? "backfill" : "transition",
          note: `Hasil observasi diinput dengan nilai ${dto.score}. ${dto.notes ? `Catatan: ${dto.notes}` : ""}`,
        },
      });

      return result;
    }, serializable);
  }

  async getRankings(periodId: string, principal: SpmbPrincipal) {
    await this.findScopedPeriod(periodId, principal);
    const registrations = await this.prisma.registration.findMany({
      where: { periodId, status: { in: ["observation_done", "accepted", "rejected"] } },
      include: { studentData: true, observationResult: true, parentData: true, period: true },
    });

    return rankObservationResults(registrations).map(({ registration, rank }) => ({
      rank,
      registrationId: registration.id,
      registrationNumber: registration.registrationNumber,
      studentName: registration.studentData?.fullName || "Belum ada nama",
      unitId: registration.period.unitId,
      score: Number(registration.observationResult.score),
      notes: registration.observationResult.notes || null,
      status: registration.status,
      source: registration.source,
    }));
  }
}
