import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateScheduleDto, BookScheduleDto, SubmitObservationResultDto } from "./observations.dto";
import { Prisma } from "../generated/prisma";

@Injectable()
export class ObservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSchedule(dto: CreateScheduleDto) {
    const period = await this.prisma.admissionPeriod.findUnique({
      where: { id: dto.periodId },
    });
    if (!period) throw new NotFoundException("Periode pendaftaran tidak ditemukan");

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
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });
  }

  async deleteSchedule(id: string) {
    const schedule = await this.prisma.observationSchedule.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });
    if (!schedule) throw new NotFoundException("Jadwal tidak ditemukan");
    if (schedule._count.bookings > 0) {
      throw new BadRequestException("Jadwal tidak dapat dihapus karena sudah ada peserta yang terdaftar");
    }
    return this.prisma.observationSchedule.delete({ where: { id } });
  }

  async bookSchedule(actorId: string, dto: BookScheduleDto) {
    return this.prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where: { id: dto.registrationId },
        include: { observationBooking: true },
      });
      if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan");

      const targetSchedule = await tx.observationSchedule.findUnique({
        where: { id: dto.observationScheduleId },
      });
      if (!targetSchedule) throw new NotFoundException("Jadwal observasi tidak ditemukan");
      if (targetSchedule.booked >= targetSchedule.quota) {
        throw new BadRequestException("Slot jadwal observasi sudah penuh");
      }

      // Jika pendaftar sudah memiliki booking sebelumnya
      if (reg.observationBooking) {
        if (reg.observationBooking.observationScheduleId === dto.observationScheduleId) {
          return reg.observationBooking;
        }
        // Kurangi counter jadwal lama
        await tx.observationSchedule.update({
          where: { id: reg.observationBooking.observationScheduleId },
          data: { booked: { decrement: 1 } },
        });
        // Update booking
        await tx.observationBooking.update({
          where: { id: reg.observationBooking.id },
          data: { observationScheduleId: dto.observationScheduleId },
        });
      } else {
        // Buat booking baru
        await tx.observationBooking.create({
          data: {
            registrationId: dto.registrationId,
            observationScheduleId: dto.observationScheduleId,
          },
        });
      }

      // Tambah counter jadwal baru
      await tx.observationSchedule.update({
        where: { id: dto.observationScheduleId },
        data: { booked: { increment: 1 } },
      });

      // Update status registrasi jika belum observation_scheduled atau di atasnya
      const prevStatus = reg.status;
      if (prevStatus === "verification" || prevStatus === "documents_uploaded") {
        await tx.registration.update({
          where: { id: reg.id },
          data: {
            status: "observation_scheduled",
          },
        });

        await tx.registrationEvent.create({
          data: {
            registrationId: reg.id,
            actorId,
            fromStatus: prevStatus,
            toStatus: "observation_scheduled",
            kind: "transition",
            note: `Memilih jadwal observasi pada ${targetSchedule.date.toISOString().slice(0, 10)} jam ${targetSchedule.startTime}`,
          },
        });
      }

      return { success: true, message: "Jadwal observasi berhasil dipilih" };
    });
  }

  async submitResult(actorId: string, dto: SubmitObservationResultDto) {
    return this.prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where: { id: dto.registrationId },
      });
      if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan");

      // Validasi score
      if (dto.score < 0 || dto.score > 100) {
        throw new BadRequestException("Nilai observasi harus berada di rentang 0 sampai 100");
      }

      const observerUserId = dto.observerId || actorId;

      // Upsert ObservationResult
      const result = await tx.observationResult.upsert({
        where: { registrationId: dto.registrationId },
        create: {
          registrationId: dto.registrationId,
          observerId: observerUserId,
          score: new Prisma.Decimal(dto.score),
          notes: dto.notes,
        },
        update: {
          observerId: observerUserId,
          score: new Prisma.Decimal(dto.score),
          notes: dto.notes,
        },
      });

      // Update registration status
      const prevStatus = reg.status;
      await tx.registration.update({
        where: { id: reg.id },
        data: {
          status: "observation_done",
        },
      });

      await tx.registrationEvent.create({
        data: {
          registrationId: reg.id,
          actorId,
          fromStatus: prevStatus,
          toStatus: "observation_done",
          kind: reg.source === "offline" ? "backfill" : "transition",
          note: `Hasil observasi diinput dengan nilai ${dto.score}. ${dto.notes ? `Catatan: ${dto.notes}` : ""}`,
        },
      });

      return result;
    });
  }

  async getRankings(periodId: string, unitId?: string) {
    const where: Prisma.RegistrationWhereInput = {
      periodId,
      status: { in: ["observation_done", "accepted", "rejected"] },
      ...(unitId ? { period: { unitId } } : {}),
    };

    const registrations = await this.prisma.registration.findMany({
      where,
      include: {
        studentData: true,
        observationResult: true,
        parentData: true,
        period: true,
      },
    });

    // Urutkan berdasarkan score desc
    const sorted = registrations
      .filter((r) => r.observationResult !== null)
      .sort((a, b) => {
        const scoreA = Number(a.observationResult?.score || 0);
        const scoreB = Number(b.observationResult?.score || 0);
        return scoreB - scoreA;
      });

    // Update rank di database dan format response
    const results = [];
    for (let i = 0; i < sorted.length; i++) {
      const rank = i + 1;
      const reg = sorted[i];
      if (reg.observationResult && reg.observationResult.rank !== rank) {
        await this.prisma.observationResult.update({
          where: { id: reg.observationResult.id },
          data: { rank },
        });
      }
      results.push({
        rank,
        registrationId: reg.id,
        registrationNumber: reg.registrationNumber,
        studentName: reg.studentData?.fullName || "Belum ada nama",
        unitId: reg.period.unitId,
        score: Number(reg.observationResult?.score || 0),
        notes: reg.observationResult?.notes || null,
        status: reg.status,
        source: reg.source,
      });
    }

    return results;
  }
}
