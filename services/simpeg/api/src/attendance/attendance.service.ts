import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { canManageUnit } from "../common/organization-access.policy";
import {
  GpsCheckInOutDto,
  UpsertGpsConfigDto,
  UpsertHolidayDto,
  UpsertSaturdayDutyAssignmentDto,
} from "./attendance.dto";
import { calculateDistance } from "./attendance.utils";
import { GpsAttendanceStatus } from "../generated/prisma";
import { resolveWorkdayPolicy, toUtcDateKey, utcDate } from "./workday-policy";

type Principal = { roles?: unknown };
type DatedAssignment = {
  unitId: string;
  unitName: string;
  role: string;
  isPrimary: boolean;
  startDate: Date;
  endDate: Date | null;
};

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private isGlobalHolidayManager(principal?: Principal): boolean {
    if (!Array.isArray(principal?.roles)) return false;
    return principal.roles.some((entry) => {
      if (!entry || typeof entry !== "object") return false;
      const { app, role } = entry as { app?: string; role?: string };
      return (role === "super_admin" && ["*", "auth", "core", "simpeg"].includes(app || ""))
        || (role === "admin_kepegawaian" && (app === "simpeg" || app === "*"));
    });
  }

  private managedUnitIds(principal?: Principal): string[] {
    if (!Array.isArray(principal?.roles)) return [];
    return principal.roles.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const { app, role, unitId } = entry as { app?: string; role?: string; unitId?: string | null };
      return app === "simpeg" && (role === "admin_unit" || role === "admin_unit_nondik") && unitId ? [unitId] : [];
    });
  }

  private assertCanManageHoliday(principal: Principal, unitId: string | null): void {
    if (unitId === null) {
      if (!this.isGlobalHolidayManager(principal)) {
        throw new ForbiddenException("Hari libur nasional hanya dapat dikelola oleh HR atau super admin.");
      }
      return;
    }

    if (!canManageUnit(principal?.roles, unitId)) {
      throw new ForbiddenException("Anda tidak berwenang mengelola hari libur unit ini.");
    }
  }

  private assertCanManageDuty(principal: Principal, unitId: string): void {
    if (!canManageUnit(principal?.roles, unitId)) {
      throw new ForbiddenException("Anda tidak berwenang mengelola piket Sabtu unit ini.");
    }
  }

  private async assertActiveUnit(unitId: string): Promise<void> {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) throw new NotFoundException("Unit tidak ditemukan.");
    if (!unit.isActive) throw new BadRequestException("Pengaturan hanya dapat dibuat untuk unit aktif.");
  }

  private async findActiveAssignment(userId: string, day: Date) {
    const dateFilter = {
      startDate: { lte: day },
      OR: [{ endDate: null }, { endDate: { gte: day } }],
    };
    return await this.prisma.employeeUnitAssignment.findFirst({
      where: { userId, isPrimary: true, ...dateFilter },
    }) || await this.prisma.employeeUnitAssignment.findFirst({
      where: { userId, ...dateFilter },
    });
  }

  private async assertActiveDutyAssignment(userId: string, unitId: string, day: Date): Promise<void> {
    const assignment = await this.prisma.employeeUnitAssignment.findFirst({
      where: {
        userId,
        unitId,
        startDate: { lte: day },
        OR: [{ endDate: null }, { endDate: { gte: day } }],
      },
    });
    if (!assignment) {
      throw new BadRequestException("Pegawai harus memiliki penugasan unit yang aktif pada tanggal piket.");
    }
  }

  async getTodayAttendanceContext(userId: string, now = new Date()) {
    const day = utcDate(now);
    const assignment = await this.findActiveAssignment(userId, day);
    if (!assignment) {
      throw new BadRequestException("Anda belum memiliki penugasan unit kerja aktif.");
    }

    const [config, holiday, dutyAssignment, leave, attendance] = await Promise.all([
      this.prisma.gpsAttendanceConfig.findUnique({ where: { unitId: assignment.unitId } }),
      this.prisma.holiday.findFirst({
        where: { date: day, OR: [{ unitId: null }, { unitId: assignment.unitId }] },
      }),
      this.prisma.saturdayDutyAssignment.findUnique({
        where: { unitId_userId_date: { unitId: assignment.unitId, userId, date: day } },
      }),
      this.prisma.leaveRequest.findFirst({
        where: { userId, status: "approved", startDate: { lte: day }, endDate: { gte: day } },
      }),
      this.prisma.gpsAttendance.findUnique({
        where: { userId_date: { userId, date: day } },
      }),
    ]);
    const workday = resolveWorkdayPolicy({
      date: day,
      hasHoliday: Boolean(holiday),
      hasApprovedLeave: Boolean(leave),
      hasSaturdayDuty: Boolean(dutyAssignment),
    });

    return {
      date: toUtcDateKey(day),
      unitId: assignment.unitId,
      unitName: assignment.unitName,
      config,
      holiday,
      dutyAssignment,
      leave,
      workday,
      attendance,
    };
  }

  private assertAttendanceRequired(context: Awaited<ReturnType<AttendanceService["getTodayAttendanceContext"]>>): void {
    if (!context.workday.required) {
      throw new BadRequestException(`Presensi tidak diwajibkan hari ini (${context.workday.reason}).`);
    }
    if (!context.config) {
      throw new BadRequestException(`Konfigurasi GPS untuk unit ${context.unitName} belum diatur.`);
    }
  }

  async checkIn(userId: string, dto: GpsCheckInOutDto, now = new Date()) {
    const context = await this.getTodayAttendanceContext(userId, now);
    this.assertAttendanceRequired(context);

    if (context.attendance?.checkInTime) {
      throw new BadRequestException("Anda sudah melakukan check in hari ini.");
    }

    const distance = calculateDistance(dto.latitude, dto.longitude, context.config.latitude, context.config.longitude);
    if (distance > context.config.radiusMeters) {
      throw new BadRequestException(
        `Anda berada di luar jangkauan lokasi unit (${Math.round(distance)}m). Maksimum radius: ${context.config.radiusMeters}m.`,
      );
    }

    const cutoff = new Date(now);
    cutoff.setUTCHours(7, 15, 0, 0);
    const status = now > cutoff ? GpsAttendanceStatus.late : GpsAttendanceStatus.present;

    return this.prisma.gpsAttendance.create({
      data: {
        userId,
        unitId: context.unitId,
        date: utcDate(context.date),
        checkInTime: now,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status,
      },
    });
  }

  async checkOut(userId: string, dto: GpsCheckInOutDto, now = new Date()) {
    const context = await this.getTodayAttendanceContext(userId, now);
    this.assertAttendanceRequired(context);

    if (!context.attendance?.checkInTime) {
      throw new BadRequestException("Anda belum melakukan check in hari ini.");
    }
    if (context.attendance.checkOutTime) {
      throw new BadRequestException("Anda sudah melakukan check out hari ini.");
    }

    const distance = calculateDistance(dto.latitude, dto.longitude, context.config.latitude, context.config.longitude);
    if (distance > context.config.radiusMeters) {
      throw new BadRequestException(
        `Anda berada di luar jangkauan lokasi unit (${Math.round(distance)}m). Maksimum radius: ${context.config.radiusMeters}m.`,
      );
    }

    return this.prisma.gpsAttendance.update({
      where: { id: context.attendance.id },
      data: { checkOutTime: now },
    });
  }

  async getMyAttendanceHistory(userId: string, month: number, year: number) {
    const startDate = utcDate(`${year}-${String(month).padStart(2, "0")}-01`);
    const endDate = new Date(Date.UTC(year, month, 0));
    return this.prisma.gpsAttendance.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "desc" },
    });
  }

  private datesInRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    for (let current = new Date(start); current <= end; current = new Date(current.getTime() + 86_400_000)) {
      dates.push(new Date(current));
    }
    return dates;
  }

  private activeAssignmentForDay(assignments: DatedAssignment[], day: Date): DatedAssignment | undefined {
    const active = assignments.filter((assignment) => assignment.startDate <= day && (!assignment.endDate || assignment.endDate >= day));
    return active.find((assignment) => assignment.isPrimary) || active[0];
  }

  async getAttendanceRecap(startDate: string, endDate: string, unitId?: string) {
    const start = utcDate(startDate);
    const end = utcDate(endDate);
    if (start > end) throw new BadRequestException("Tanggal mulai tidak boleh setelah tanggal selesai.");

    const whereUser: any = { isActive: true };
    if (unitId) whereUser.unitAssignments = { some: { unitId } };

    const users = await this.prisma.user.findMany({
      where: whereUser,
      select: {
        id: true,
        fullName: true,
        unitAssignments: {
          select: { unitId: true, unitName: true, role: true, isPrimary: true, startDate: true, endDate: true },
        },
      },
      orderBy: { fullName: "asc" },
    });
    const userIds = users.map((user) => user.id);
    const [attendances, leaves, holidays, duties] = await Promise.all([
      this.prisma.gpsAttendance.findMany({
        where: { date: { gte: start, lte: end }, ...(unitId ? { unitId } : {}) },
      }),
      this.prisma.leaveRequest.findMany({
        where: { status: "approved", startDate: { lte: end }, endDate: { gte: start } },
      }),
      this.prisma.holiday.findMany({ where: { date: { gte: start, lte: end } } }),
      this.prisma.saturdayDutyAssignment.findMany({
        where: { date: { gte: start, lte: end }, ...(userIds.length ? { userId: { in: userIds } } : {}) },
      }),
    ]);
    const days = this.datesInRange(start, end);

    return users.map((user) => {
      const assignments = user.unitAssignments as DatedAssignment[];
      const userAttendances = attendances.filter((attendance) => attendance.userId === user.id);
      const presentCount = userAttendances.filter((attendance) => attendance.status === GpsAttendanceStatus.present).length;
      const lateCount = userAttendances.filter((attendance) => attendance.status === GpsAttendanceStatus.late).length;
      const userLeaves = leaves.filter((leave) => leave.userId === user.id);

      let expectedWorkdays = 0;
      let exemptWorkdays = 0;
      let unrecordedRequiredDays = 0;
      let leaveDays = 0;
      for (const day of days) {
        const assignment = this.activeAssignmentForDay(assignments, day);
        const holiday = holidays.some((item) => toUtcDateKey(item.date) === toUtcDateKey(day) && (item.unitId === null || item.unitId === assignment?.unitId));
        const leave = userLeaves.some((item) => item.startDate <= day && item.endDate >= day);
        const duty = duties.some((item) => item.userId === user.id && item.unitId === assignment?.unitId && toUtcDateKey(item.date) === toUtcDateKey(day));
        const policy = resolveWorkdayPolicy({ date: day, hasHoliday: holiday, hasApprovedLeave: leave, hasSaturdayDuty: duty });

        if (policy.required) {
          expectedWorkdays += 1;
          if (!userAttendances.some((attendance) => toUtcDateKey(attendance.date) === toUtcDateKey(day))) {
            unrecordedRequiredDays += 1;
          }
        } else {
          exemptWorkdays += 1;
          if (policy.reason === "approved_leave") leaveDays += 1;
        }
      }

      const primaryUnit = assignments.find((assignment) => assignment.isPrimary) || assignments[0];
      return {
        userId: user.id,
        fullName: user.fullName,
        unitName: primaryUnit?.unitName || "Belum ditugaskan",
        role: primaryUnit?.role || "Staff",
        present: presentCount,
        late: lateCount,
        leave: leaveDays,
        totalLogs: userAttendances.length,
        expectedWorkdays,
        exemptWorkdays,
        unrecordedRequiredDays,
      };
    });
  }

  async getGpsConfigs(principal?: Principal) {
    const configs = await this.prisma.gpsAttendanceConfig.findMany({ orderBy: { createdAt: "desc" } });
    const visibleConfigs = principal ? configs.filter((config) => canManageUnit(principal.roles, config.unitId)) : configs;
    const unitIds = [...new Set(visibleConfigs.map((config) => config.unitId))];
    const units = unitIds.length
      ? await this.prisma.unit.findMany({
        where: { id: { in: unitIds } },
        select: { id: true, name: true, code: true, category: true, isActive: true },
      })
      : [];
    const unitsById = new Map(units.map((unit) => [unit.id, unit]));
    return visibleConfigs.map((config) => ({ ...config, unit: unitsById.get(config.unitId) ?? null }));
  }

  async upsertGpsConfig(dto: UpsertGpsConfigDto, principal: Principal) {
    if (!canManageUnit(principal?.roles, dto.unitId)) {
      throw new ForbiddenException("Anda tidak berwenang mengatur lokasi GPS unit ini.");
    }
    await this.assertActiveUnit(dto.unitId);
    return this.prisma.gpsAttendanceConfig.upsert({
      where: { unitId: dto.unitId },
      update: { latitude: dto.latitude, longitude: dto.longitude, radiusMeters: dto.radiusMeters },
      create: { unitId: dto.unitId, latitude: dto.latitude, longitude: dto.longitude, radiusMeters: dto.radiusMeters },
    });
  }

  async getHolidays(unitId: string | undefined, principal: Principal) {
    if (unitId && !this.isGlobalHolidayManager(principal) && !canManageUnit(principal.roles, unitId)) {
      throw new ForbiddenException("Anda tidak berwenang melihat hari libur unit ini.");
    }
    const holidays = await this.prisma.holiday.findMany({ orderBy: { date: "asc" } });
    if (this.isGlobalHolidayManager(principal)) {
      return unitId ? holidays.filter((holiday) => holiday.unitId === null || holiday.unitId === unitId) : holidays;
    }
    const visibleUnitIds = new Set(this.managedUnitIds(principal));
    return holidays.filter((holiday) => holiday.unitId === null || (holiday.unitId !== null && visibleUnitIds.has(holiday.unitId)));
  }

  async upsertHoliday(dto: UpsertHolidayDto, principal: Principal) {
    const day = utcDate(dto.date);
    const dataFor = (fallbackUnitId: string | null) => {
      const unitId = Object.prototype.hasOwnProperty.call(dto, "unitId") ? dto.unitId ?? null : fallbackUnitId;
      return {
        unitId,
        date: day,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
      };
    };

    if (dto.id) {
      const holiday = await this.prisma.holiday.findUnique({ where: { id: dto.id } });
      if (!holiday) throw new NotFoundException("Hari libur tidak ditemukan.");
      this.assertCanManageHoliday(principal, holiday.unitId);
      const data = dataFor(holiday.unitId);
      this.assertCanManageHoliday(principal, data.unitId);
      if (data.unitId) await this.assertActiveUnit(data.unitId);
      return this.prisma.holiday.update({ where: { id: holiday.id }, data });
    }

    const data = dataFor(null);
    this.assertCanManageHoliday(principal, data.unitId);
    if (data.unitId) await this.assertActiveUnit(data.unitId);
    return this.prisma.holiday.create({ data });
  }

  async deleteHoliday(id: string, principal: Principal) {
    const holiday = await this.prisma.holiday.findUnique({ where: { id } });
    if (!holiday) throw new NotFoundException("Hari libur tidak ditemukan.");
    this.assertCanManageHoliday(principal, holiday.unitId);
    return this.prisma.holiday.delete({ where: { id: holiday.id } });
  }

  async getSaturdayDutyAssignments(unitId: string | undefined, principal: Principal) {
    if (unitId && !this.isGlobalHolidayManager(principal) && !canManageUnit(principal.roles, unitId)) {
      throw new ForbiddenException("Anda tidak berwenang melihat piket Sabtu unit ini.");
    }
    const duties = await this.prisma.saturdayDutyAssignment.findMany({ orderBy: { date: "asc" } });
    if (this.isGlobalHolidayManager(principal)) return unitId ? duties.filter((duty) => duty.unitId === unitId) : duties;
    const visibleUnitIds = new Set(this.managedUnitIds(principal));
    return duties.filter((duty) => visibleUnitIds.has(duty.unitId));
  }

  async upsertSaturdayDutyAssignment(dto: UpsertSaturdayDutyAssignmentDto, principal: Principal) {
    const day = utcDate(dto.date);
    const data = {
      unitId: dto.unitId,
      userId: dto.userId,
      date: day,
      notes: dto.notes?.trim() || null,
    };

    if (dto.id) {
      const duty = await this.prisma.saturdayDutyAssignment.findUnique({ where: { id: dto.id } });
      if (!duty) throw new NotFoundException("Piket Sabtu tidak ditemukan.");
      this.assertCanManageDuty(principal, duty.unitId);
      this.assertCanManageDuty(principal, data.unitId);
      await this.assertActiveUnit(data.unitId);
      await this.assertActiveDutyAssignment(data.userId, data.unitId, day);
      return this.prisma.saturdayDutyAssignment.update({ where: { id: duty.id }, data });
    }

    this.assertCanManageDuty(principal, data.unitId);
    await this.assertActiveUnit(data.unitId);
    await this.assertActiveDutyAssignment(data.userId, data.unitId, day);
    return this.prisma.saturdayDutyAssignment.create({ data });
  }

  async deleteSaturdayDutyAssignment(id: string, principal: Principal) {
    const duty = await this.prisma.saturdayDutyAssignment.findUnique({ where: { id } });
    if (!duty) throw new NotFoundException("Piket Sabtu tidak ditemukan.");
    this.assertCanManageDuty(principal, duty.unitId);
    return this.prisma.saturdayDutyAssignment.delete({ where: { id: duty.id } });
  }
}
