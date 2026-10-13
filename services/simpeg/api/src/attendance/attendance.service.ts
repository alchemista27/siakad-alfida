import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GpsCheckInOutDto, UpsertGpsConfigDto, UpsertHolidayDto } from "./attendance.dto";
import { calculateDistance } from "./attendance.utils";
import { GpsAttendanceStatus } from "../generated/prisma";

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getTodayAttendanceContext(userId: string) {
    // Cari penugasan unit aktif pegawai
    const assignment = await this.prisma.employeeUnitAssignment.findFirst({
      where: {
        userId,
        isPrimary: true,
      },
    }) || await this.prisma.employeeUnitAssignment.findFirst({
      where: { userId },
    });

    if (!assignment) {
      throw new BadRequestException("Anda belum memiliki penugasan unit kerja aktif.");
    }

    const config = await this.prisma.gpsAttendanceConfig.findUnique({
      where: { unitId: assignment.unitId },
    });

    if (!config) {
      throw new BadRequestException(`Konfigurasi GPS untuk unit ${assignment.unitName} belum diatur.`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const holiday = await this.prisma.holiday.findFirst({
      where: {
        date: today,
        OR: [{ unitId: null }, { unitId: assignment.unitId }],
      },
    });

    const attendance = await this.prisma.gpsAttendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    return {
      unitId: assignment.unitId,
      unitName: assignment.unitName,
      config,
      holiday,
      attendance,
    };
  }

  async checkIn(userId: string, dto: GpsCheckInOutDto) {
    const context = await this.getTodayAttendanceContext(userId);

    if (context.holiday) {
      throw new BadRequestException("Hari ini adalah hari libur, tidak perlu melakukan absensi.");
    }

    if (context.attendance?.checkInTime) {
      throw new BadRequestException("Anda sudah melakukan check in hari ini.");
    }

    const distance = calculateDistance(
      dto.latitude,
      dto.longitude,
      context.config.latitude,
      context.config.longitude
    );

    if (distance > context.config.radiusMeters) {
      throw new BadRequestException(
        `Anda berada di luar jangkauan lokasi unit (${Math.round(distance)}m). Maksimum radius: ${context.config.radiusMeters}m.`
      );
    }

    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(7, 15, 0, 0);

    const status = now > cutoff ? GpsAttendanceStatus.late : GpsAttendanceStatus.present;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.gpsAttendance.create({
      data: {
        userId,
        unitId: context.unitId,
        date: today,
        checkInTime: now,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status,
      },
    });
  }

  async checkOut(userId: string, dto: GpsCheckInOutDto) {
    const context = await this.getTodayAttendanceContext(userId);

    if (!context.attendance?.checkInTime) {
      throw new BadRequestException("Anda belum melakukan check in hari ini.");
    }

    if (context.attendance.checkOutTime) {
      throw new BadRequestException("Anda sudah melakukan check out hari ini.");
    }

    const distance = calculateDistance(
      dto.latitude,
      dto.longitude,
      context.config.latitude,
      context.config.longitude
    );

    if (distance > context.config.radiusMeters) {
      throw new BadRequestException(
        `Anda berada di luar jangkauan lokasi unit (${Math.round(distance)}m). Maksimum radius: ${context.config.radiusMeters}m.`
      );
    }

    return this.prisma.gpsAttendance.update({
      where: { id: context.attendance.id },
      data: {
        checkOutTime: new Date(),
      },
    });
  }

  async getMyAttendanceHistory(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.prisma.gpsAttendance.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "desc" },
    });
  }

  async getAttendanceRecap(startDate: string, endDate: string, unitId?: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const whereUser: any = { isActive: true };
    if (unitId) {
      whereUser.unitAssignments = { some: { unitId } };
    }

    const users = await this.prisma.user.findMany({
      where: whereUser,
      select: {
        id: true,
        fullName: true,
        unitAssignments: {
          select: { unitName: true, role: true, isPrimary: true },
        },
      },
      orderBy: { fullName: "asc" },
    });

    const attendances = await this.prisma.gpsAttendance.findMany({
      where: {
        date: { gte: start, lte: end },
        ...(unitId ? { unitId } : {}),
      },
    });

    const leaves = await this.prisma.leaveRequest.findMany({
      where: {
        status: "approved",
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    return users.map((u) => {
      const userAttendances = attendances.filter((a) => a.userId === u.id);
      const presentCount = userAttendances.filter((a) => a.status === GpsAttendanceStatus.present).length;
      const lateCount = userAttendances.filter((a) => a.status === GpsAttendanceStatus.late).length;

      const userLeaves = leaves.filter((l) => l.userId === u.id);
      let leaveDays = 0;
      for (const l of userLeaves) {
        const leaveStart = l.startDate < start ? start : l.startDate;
        const leaveEnd = l.endDate > end ? end : l.endDate;
        const days = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 3600 * 24)) + 1;
        leaveDays += Math.max(0, days);
      }

      const primaryUnit = u.unitAssignments.find((a) => a.isPrimary) || u.unitAssignments[0];

      return {
        userId: u.id,
        fullName: u.fullName,
        unitName: primaryUnit?.unitName || "Belum ditugaskan",
        role: primaryUnit?.role || "Staff",
        present: presentCount,
        late: lateCount,
        leave: leaveDays,
        totalLogs: userAttendances.length,
      };
    });
  }

  // ================= CONFIG & HOLIDAYS =================
  async getGpsConfigs() {
    return this.prisma.gpsAttendanceConfig.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async upsertGpsConfig(dto: UpsertGpsConfigDto) {
    return this.prisma.gpsAttendanceConfig.upsert({
      where: { unitId: dto.unitId },
      update: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        radiusMeters: dto.radiusMeters ?? 50,
      },
      create: {
        unitId: dto.unitId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        radiusMeters: dto.radiusMeters ?? 50,
      },
    });
  }

  async getHolidays(unitId?: string) {
    const where: any = {};
    if (unitId) {
      where.OR = [{ unitId: null }, { unitId }];
    }
    return this.prisma.holiday.findMany({
      where,
      orderBy: { date: "asc" },
    });
  }

  async upsertHoliday(dto: UpsertHolidayDto) {
    if (dto.id) {
      return this.prisma.holiday.update({
        where: { id: dto.id },
        data: {
          unitId: dto.unitId || null,
          date: new Date(dto.date),
          name: dto.name,
          description: dto.description || null,
        },
      });
    }

    return this.prisma.holiday.create({
      data: {
        unitId: dto.unitId || null,
        date: new Date(dto.date),
        name: dto.name,
        description: dto.description || null,
      },
    });
  }

  async deleteHoliday(id: string) {
    return this.prisma.holiday.delete({
      where: { id },
    });
  }
}
