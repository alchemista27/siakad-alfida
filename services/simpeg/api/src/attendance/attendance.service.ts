import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { canManageUnit } from "../common/organization-access.policy";
import {
  GpsCheckInOutDto,
  UpsertGpsConfigDto,
  UpsertHolidayDto,
  UpsertSaturdayDutyAssignmentDto,
  UpsertUnitWorkScheduleDto,
  validWorkHours,
} from "./attendance.dto";
import { calculateDistance } from "./attendance.utils";
import { GpsAttendanceStatus } from "../generated/prisma";
import { resolveWorkdayPolicy, toUtcDateKey, utcDate } from "./workday-policy";
import { jakartaDateKey, jakartaMinutes, hhmmMinutes, overtimeMinutesFor } from "./jakarta-worktime";

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

  private get schedules() { return this.prisma.unitWorkSchedule; }

  async getWorkSchedules(unitId: string, principal: Principal) {
    if (!canManageUnit(principal?.roles, unitId)) throw new ForbiddenException("Anda tidak berwenang melihat jadwal unit ini.");
    await this.assertActiveUnit(unitId);
    return this.schedules.findMany({ where: { unitId }, orderBy: { weekday: "asc" } });
  }

  async upsertWorkSchedule(unitId: string, weekday: number, dto: UpsertUnitWorkScheduleDto, principal: Principal) {
    if (!canManageUnit(principal?.roles, unitId)) throw new ForbiddenException("Anda tidak berwenang mengatur jadwal unit ini.");
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) throw new BadRequestException("Hari harus 0–6.");
    if (dto.isWorkday !== true && dto.isWorkday !== false) throw new BadRequestException("Status hari kerja tidak valid.");
    if (dto.isWorkday ? !validWorkHours(dto) :
      [dto.startTime, dto.lateGraceMinutes, dto.endTime, dto.overtimeStartTime].some(value => value !== undefined && value !== null)) {
      throw new BadRequestException("Jam jadwal kerja tidak valid atau tidak lengkap.");
    }
    await this.assertActiveUnit(unitId);
    const data = { isWorkday: dto.isWorkday, startTime: dto.isWorkday ? dto.startTime! : null,
      lateGraceMinutes: dto.isWorkday ? dto.lateGraceMinutes! : null,
      endTime: dto.isWorkday ? dto.endTime! : null, overtimeStartTime: dto.isWorkday ? dto.overtimeStartTime! : null };
    return this.schedules.upsert({ where: { unitId_weekday: { unitId, weekday } },
      create: { unitId, weekday, ...data }, update: data });
  }

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
    const day = utcDate(jakartaDateKey(now));
    const assignment = await this.findActiveAssignment(userId, day);
    if (!assignment) {
      throw new BadRequestException("Anda belum memiliki penugasan unit kerja aktif.");
    }

    const [config, holiday, dutyAssignment, leave, attendance, schedule] = await Promise.all([
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
      this.schedules.findUnique({ where: { unitId_weekday: { unitId: assignment.unitId, weekday: day.getUTCDay() } } }),
    ]);
    const workday = resolveWorkdayPolicy({
      date: day,
      hasHoliday: Boolean(holiday),
      hasApprovedLeave: Boolean(leave),
      hasSaturdayDuty: Boolean(dutyAssignment),
      configuredIsWorkday: schedule?.isWorkday,
    });

    const duty = dutyAssignment as typeof dutyAssignment & {startTime?: string | null; lateGraceMinutes?: number | null; endTime?: string | null; overtimeStartTime?: string | null};
    const sourceHours = day.getUTCDay() === 6 && dutyAssignment
      ? validWorkHours(duty) ? duty : schedule?.isWorkday && validWorkHours(schedule) ? schedule : null
      : schedule?.isWorkday && validWorkHours(schedule) ? schedule : null;
    const workSchedule = {
      startTime: sourceHours?.startTime ?? "07:15",
      lateGraceMinutes: sourceHours?.lateGraceMinutes ?? 0,
      endTime: sourceHours?.endTime ?? null,
      overtimeStartTime: sourceHours?.overtimeStartTime ?? null,
      timezone: "Asia/Jakarta" as const,
      source: (day.getUTCDay() === 6 && dutyAssignment && sourceHours === duty ? "duty" : sourceHours ? "unit" : "legacy") as "duty" | "unit" | "legacy",
    };

    return {
      date: toUtcDateKey(day),
      unitId: assignment.unitId,
      unitName: assignment.unitName,
      config,
      holiday,
      dutyAssignment,
      leave,
      workday,
      workSchedule,
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

  /** Advisory quality checks only: device-reported fields are not attestation. */
  private assertLocationEvidence(dto: GpsCheckInOutDto, radiusMeters: number, now: Date): void {
    if (dto.mocked === true) throw new BadRequestException("Lokasi mock terdeteksi.");
    if (dto.mocked !== undefined && dto.mocked !== false) throw new BadRequestException("Status lokasi tidak valid.");
    const supplied = dto.accuracyMeters !== undefined || dto.capturedAt !== undefined || dto.mocked !== undefined;
    if (!supplied) return; // Legacy web check-in/out sends coordinates only.
    if (typeof dto.accuracyMeters !== "number" || !Number.isFinite(dto.accuracyMeters) ||
      dto.accuracyMeters < 0 || dto.accuracyMeters > Math.min(50, radiusMeters)) {
      throw new BadRequestException("Akurasi lokasi tidak memadai.");
    }
    const captured = typeof dto.capturedAt === "string" ? Date.parse(dto.capturedAt) : NaN;
    if (!Number.isFinite(captured) || captured < now.getTime() - 15_000 || captured > now.getTime() + 5_000) {
      throw new BadRequestException("Fix lokasi sudah kedaluwarsa atau waktunya tidak valid.");
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
    this.assertLocationEvidence(dto, context.config.radiusMeters, now);

    const { workSchedule } = context;
    const status = jakartaMinutes(now) > hhmmMinutes(workSchedule.startTime) + workSchedule.lateGraceMinutes
      ? GpsAttendanceStatus.late : GpsAttendanceStatus.present;

    return this.prisma.gpsAttendance.create({
      data: {
        userId,
        unitId: context.unitId,
        date: utcDate(context.date),
        checkInTime: now,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status,
        workScheduleSnapshot: workSchedule,
        overtimeMinutes: 0,
      } as any,
    });
  }

  async checkOut(userId: string, dto: GpsCheckInOutDto, now = new Date()) {
    const context = await this.getTodayAttendanceContext(userId, now);
    if (!context.config) throw new BadRequestException(`Konfigurasi GPS untuk unit ${context.unitName} belum diatur.`);

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
    this.assertLocationEvidence(dto, context.config.radiusMeters, now);

    const stored = context.attendance as typeof context.attendance & {workScheduleSnapshot?: unknown};
    const snapshot = stored.workScheduleSnapshot;
    const overtimeStartTime = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) &&
      typeof (snapshot as {overtimeStartTime?: unknown}).overtimeStartTime === "string"
      ? (snapshot as {overtimeStartTime: string}).overtimeStartTime : null;
    if (jakartaDateKey(context.attendance.checkInTime) !== context.date || jakartaDateKey(now) !== context.date || now <= context.attendance.checkInTime) {
      throw new BadRequestException("Check out harus pada hari WIB yang sama setelah check in.");
    }
    const overtimeMinutes = overtimeMinutesFor({ date: context.date, checkIn: context.attendance.checkInTime,
      checkOut: now, overtimeStartTime });
    const updated = await this.prisma.gpsAttendance.updateMany({
      where: { id: context.attendance.id, checkOutTime: null },
      data: { checkOutTime: now, overtimeMinutes } as any,
    });
    if (updated.count !== 1) throw new BadRequestException("Anda sudah melakukan check out hari ini.");
    return this.prisma.gpsAttendance.findUnique({ where: { id: context.attendance.id } });
  }

  async getMyAttendanceHistory(userId: string, month: number, year: number) {
    const startDate = utcDate(`${year}-${String(month).padStart(2, "0")}-01`);
    const endDate = new Date(Date.UTC(year, month, 0));
    const rows = await this.prisma.gpsAttendance.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "desc" },
    });
    return rows.map(row => ({ ...row, overtimeMinutes: this.validRecordedOvertime(row) }));
  }

  private validRecordedOvertime(row: {date: Date; checkInTime: Date | null; checkOutTime: Date | null}): number {
    const recorded = (row as typeof row & {overtimeMinutes?: number}).overtimeMinutes;
    const date = toUtcDateKey(row.date);
    return row.checkInTime && row.checkOutTime && jakartaDateKey(row.checkInTime) === date &&
      jakartaDateKey(row.checkOutTime) === date && row.checkOutTime > row.checkInTime &&
      Number.isInteger(recorded) && (recorded as number) >= 0 ? recorded as number : 0;
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
    const [attendances, leaves, holidays, duties, schedules] = await Promise.all([
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
      this.schedules.findMany({ where: unitId ? {unitId} : {unitId: {in: [...new Set(users.flatMap(user => user.unitAssignments.map(item => item.unitId)))]}} }),
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
        const schedule = schedules.find((item: any) => item.unitId === assignment?.unitId && item.weekday === day.getUTCDay());
        const policy = resolveWorkdayPolicy({ date: day, hasHoliday: holiday, hasApprovedLeave: leave,
          hasSaturdayDuty: duty, configuredIsWorkday: schedule?.isWorkday });

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
        overtimeMinutes: userAttendances.reduce((total, attendance) => total + this.validRecordedOvertime(attendance), 0),
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
      if (holiday.unitId === null) throw new BadRequestException("Hari libur nasional berasal dari provider dan tidak dapat diedit manual.");
      const data = dataFor(holiday.unitId);
      this.assertCanManageHoliday(principal, data.unitId);
      if (data.unitId === null) throw new BadRequestException("Hari libur nasional berasal dari provider.");
      if (data.unitId) await this.assertActiveUnit(data.unitId);
      return this.prisma.holiday.update({ where: { id: holiday.id }, data });
    }

    const data = dataFor(null);
    this.assertCanManageHoliday(principal, data.unitId);
    if (data.unitId === null) throw new BadRequestException("Hari libur nasional berasal dari provider.");
    if (data.unitId) await this.assertActiveUnit(data.unitId);
    return this.prisma.holiday.create({ data });
  }

  async deleteHoliday(id: string, principal: Principal) {
    const holiday = await this.prisma.holiday.findUnique({ where: { id } });
    if (!holiday) throw new NotFoundException("Hari libur tidak ditemukan.");
    this.assertCanManageHoliday(principal, holiday.unitId);
    if (holiday.unitId === null) throw new BadRequestException("Hari libur nasional berasal dari provider dan tidak dapat dihapus manual.");
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
    const hasHours = [dto.startTime, dto.lateGraceMinutes, dto.endTime, dto.overtimeStartTime]
      .some((value) => value !== undefined && value !== null);
    const hours = hasHours ? {
      startTime: dto.startTime,
      lateGraceMinutes: dto.lateGraceMinutes,
      endTime: dto.endTime,
      overtimeStartTime: dto.overtimeStartTime,
    } : {};
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
      if (hasHours && !validWorkHours(dto)) throw new BadRequestException("Jam piket tidak valid atau tidak lengkap.");
      await this.assertActiveUnit(data.unitId);
      await this.assertActiveDutyAssignment(data.userId, data.unitId, day);
      return this.prisma.saturdayDutyAssignment.update({ where: { id: duty.id }, data: { ...data, ...hours } as any });
    }

    this.assertCanManageDuty(principal, data.unitId);
    if (!validWorkHours(dto)) throw new BadRequestException("Jam piket tidak valid atau tidak lengkap.");
    await this.assertActiveUnit(data.unitId);
    await this.assertActiveDutyAssignment(data.userId, data.unitId, day);
    return this.prisma.saturdayDutyAssignment.create({ data: { ...data, ...hours } as any });
  }

  async deleteSaturdayDutyAssignment(id: string, principal: Principal) {
    const duty = await this.prisma.saturdayDutyAssignment.findUnique({ where: { id } });
    if (!duty) throw new NotFoundException("Piket Sabtu tidak ditemukan.");
    this.assertCanManageDuty(principal, duty.unitId);
    return this.prisma.saturdayDutyAssignment.delete({ where: { id: duty.id } });
  }
}
