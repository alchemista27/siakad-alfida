import { BadRequestException, Injectable } from "@nestjs/common";
import { GpsAttendanceStatus } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { jakartaDateKey, jakartaMinutes, hhmmMinutes } from "./jakarta-worktime";
import { FingerprintDeviceClient } from "./fingerprint-device.client";
import { FingerprintDeviceEvent } from "./fingerprint-device.client";
import { AuthStaffCandidateClient } from "../employees/auth-staff-candidate.client";
import { isOfficeWeekday, normalizeFingerprintEvent, NormalizedFingerprintEvent, selectDailyFingerprintWindow } from "./fingerprint-attendance.utils";
import { resolveWorkdayPolicy, utcDate } from "./workday-policy";

export type FingerprintSyncInput = { startDate?: string; endDate?: string };

type SyncCounters = {
  runId: string;
  fetchedCount: number;
  insertedCount: number;
  matchedCount: number;
  unmatchedCount: number;
  attendanceChanged: number;
  skippedConflict: number;
};

const INITIAL_START = "2026-10-01";
const INITIAL_END = "2026-10-31";

function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(utcDate(value).getTime());
}

function errorMessage(error: unknown): string {
  return (error instanceof Error ? error.message : "Sinkronisasi fingerprint gagal.")
    .replace(/(?:token|password|comm[_ -]?key)=?[^\s]*/gi, "[REDACTED]")
    .slice(0, 500);
}

@Injectable()
export class FingerprintAttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly device: FingerprintDeviceClient,
    private readonly authStaffCandidates: AuthStaffCandidateClient,
  ) {}

  private range(input: FingerprintSyncInput) {
    const hasStart = input.startDate !== undefined;
    const hasEnd = input.endDate !== undefined;
    if (hasStart !== hasEnd) throw new BadRequestException("Tanggal awal dan akhir sinkronisasi harus diisi bersama.");
    if (!hasStart) {
      const today = jakartaDateKey(new Date());
      return { startDate: today, endDate: today };
    }
    const startDate = input.startDate!;
    const endDate = input.endDate!;
    if (!validDate(startDate) || !validDate(endDate) || startDate > endDate) throw new BadRequestException("Rentang sinkronisasi fingerprint tidak valid.");
    if (startDate < INITIAL_START || endDate > INITIAL_END) throw new BadRequestException("Import histori fingerprint hanya diizinkan untuk 1–31 Oktober 2026.");
    return { startDate, endDate };
  }

  private async eligibleAuthUserIds(userIds: string[]): Promise<Set<string>> {
    const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
    if (!uniqueUserIds.length) return new Set();
    return new Set(await this.authStaffCandidates.eligibleUserIds(uniqueUserIds));
  }

  async sync(input: FingerprintSyncInput = {}): Promise<SyncCounters> {
    const range = this.range(input);
    const startedAt = new Date();
    const configuredDeviceId = process.env.SIMPEG_FINGERPRINT_DEVICE_ID?.trim() || "solution-x100c";
    const run = await (this.prisma as any).fingerprintSyncRun.create({ data: { deviceId: configuredDeviceId, startedAt, status: "running" } });
    const counters: SyncCounters = { runId: run.id, fetchedCount: 0, insertedCount: 0, matchedCount: 0, unmatchedCount: 0, attendanceChanged: 0, skippedConflict: 0 };
    try {
      const read = await this.device.readAttendance();
      const normalized = read.events
        .map((event: FingerprintDeviceEvent) => normalizeFingerprintEvent(read.device.id, read.device.serial, event))
        .filter((event) => {
          const day = event.localDate.toISOString().slice(0, 10);
          return day >= range.startDate && day <= range.endDate && isOfficeWeekday(day);
        });
      counters.fetchedCount = read.events.length;
      const enrollmentIds = [...new Set(normalized.map((event) => event.enrollmentId))];
      const profiles = enrollmentIds.length ? await (this.prisma as any).employeeProfile.findMany({
        where: { fingerprintEnrollmentId: { in: enrollmentIds } },
        select: { userId: true, fingerprintEnrollmentId: true },
      }) : [];
      const eligibleUserIds = await this.eligibleAuthUserIds(profiles.map((profile: any) => profile.userId));
      const profilesByEnrollment = new Map(profiles.map((profile: any) => [profile.fingerprintEnrollmentId, profile]));
      const usersByEnrollment = new Map(profiles
        .filter((profile: any) => eligibleUserIds.has(profile.userId))
        .map((profile: any) => [profile.fingerprintEnrollmentId, profile.userId]));
      const rejectedEventsByUser = new Map<string, Set<Date>>();
      for (const event of normalized) {
        const profile = profilesByEnrollment.get(event.enrollmentId) as { userId: string } | undefined;
        if (profile && !eligibleUserIds.has(profile.userId)) {
          const days = rejectedEventsByUser.get(profile.userId) ?? new Set<Date>();
          days.add(event.localDate);
          rejectedEventsByUser.set(profile.userId, days);
        }
      }
      await Promise.all([
        ...[...usersByEnrollment.entries()].map(([enrollmentId, userId]) =>
          (this.prisma as any).fingerprintAttendanceEvent.updateMany({ where: { enrollmentId, userId: null }, data: { userId } })),
        ...profiles.filter((profile: any) => !eligibleUserIds.has(profile.userId)).map((profile: any) =>
          (this.prisma as any).fingerprintAttendanceEvent.updateMany({ where: { enrollmentId: profile.fingerprintEnrollmentId, userId: profile.userId }, data: { userId: null } })),
        ...[...rejectedEventsByUser.entries()].map(([userId, days]) =>
          (this.prisma as any).gpsAttendance.deleteMany({ where: { userId, source: "fingerprint", date: { in: [...days] } } })),
      ]);
      const existing = normalized.length ? await (this.prisma as any).fingerprintAttendanceEvent.findMany({
        where: { sourceKey: { in: normalized.map((event) => event.sourceKey) } }, select: { sourceKey: true },
      }) : [];
      const existingKeys = new Set(existing.map((event: any) => event.sourceKey));
      const rows = normalized.map((event) => ({
        sourceKey: event.sourceKey,
        deviceId: read.device.id,
        deviceSerial: read.device.serial,
        enrollmentId: event.enrollmentId,
        occurredAt: event.occurredAt,
        localDate: event.localDate,
        punch: event.punch,
        status: event.status,
        userId: usersByEnrollment.get(event.enrollmentId) ?? null,
      }));
      const fresh = rows.filter((row) => !existingKeys.has(row.sourceKey));
      if (fresh.length) {
        const created = await (this.prisma as any).fingerprintAttendanceEvent.createMany({ data: fresh, skipDuplicates: true });
        counters.insertedCount = created.count;
      }
      const affected = new Map<string, Date>();
      for (const event of normalized) {
        const userId = usersByEnrollment.get(event.enrollmentId);
        if (!userId) {
          counters.unmatchedCount += 1;
          continue;
        }
        counters.matchedCount += 1;
        affected.set(`${userId}:${event.localDate.toISOString()}`, event.localDate);
      }
      for (const [key, localDate] of affected) {
        const [userId] = key.split(":");
        const result = await this.reconcileDay(userId, localDate);
        counters.attendanceChanged += result.changed;
        counters.skippedConflict += result.skippedConflict;
      }
      const { runId: _runId, ...persistedCounters } = counters;
      await (this.prisma as any).fingerprintSyncRun.update({
        where: { id: run.id },
        data: { ...persistedCounters, status: "completed", completedAt: new Date() },
      });
      return counters;
    } catch (error) {
      const { runId: _runId, ...persistedCounters } = counters;
      await (this.prisma as any).fingerprintSyncRun.update({
        where: { id: run.id }, data: { status: "failed", completedAt: new Date(), errorMessage: errorMessage(error), ...persistedCounters },
      });
      throw error;
    }
  }

  private async reconcileDay(userId: string, localDate: Date): Promise<{ changed: number; skippedConflict: number }> {
    const day = utcDate(localDate);
    const events = await (this.prisma as any).fingerprintAttendanceEvent.findMany({
      where: { userId, localDate: day }, orderBy: { occurredAt: "asc" },
    }) as Array<NormalizedFingerprintEvent>;
    if (!events.length) return { changed: 0, skippedConflict: 0 };
    const assignment = await (this.prisma as any).employeeUnitAssignment.findFirst({
      where: { userId, startDate: { lte: day }, OR: [{ endDate: null }, { endDate: { gte: day } }] }, orderBy: { isPrimary: "desc" },
    });
    if (!assignment) return { changed: 0, skippedConflict: 0 };
    const [leave, holiday, duty, schedule] = await Promise.all([
      (this.prisma as any).leaveRequest.findFirst({ where: { userId, status: "approved", startDate: { lte: day }, endDate: { gte: day } } }),
      (this.prisma as any).holiday.findFirst({ where: { date: day, OR: [{ unitId: null }, { unitId: assignment.unitId }] } }),
      (this.prisma as any).saturdayDutyAssignment.findUnique({ where: { unitId_userId_date: { unitId: assignment.unitId, userId, date: day } } }),
      (this.prisma as any).unitWorkSchedule.findUnique({ where: { unitId_weekday: { unitId: assignment.unitId, weekday: day.getUTCDay() } } }),
    ]);
    const workday = resolveWorkdayPolicy({ date: day, hasHoliday: Boolean(holiday), hasApprovedLeave: Boolean(leave), hasSaturdayDuty: Boolean(duty), configuredIsWorkday: schedule?.isWorkday });
    if (!workday.required) return { changed: 0, skippedConflict: 0 };
    const window = selectDailyFingerprintWindow(events);
    const startTime = schedule?.isWorkday && schedule.startTime ? schedule.startTime : "07:15";
    const lateGraceMinutes = schedule?.isWorkday && Number.isInteger(schedule.lateGraceMinutes) ? schedule.lateGraceMinutes : 0;
    const status = jakartaMinutes(window.checkInTime) > hhmmMinutes(startTime) + lateGraceMinutes ? GpsAttendanceStatus.late : GpsAttendanceStatus.present;
    const existing = await (this.prisma as any).gpsAttendance.findUnique({ where: { userId_date: { userId, date: day } } });
    if (existing && existing.source !== "fingerprint") return { changed: 0, skippedConflict: 1 };
    const data = {
      unitId: assignment.unitId,
      checkInTime: window.checkInTime,
      checkOutTime: window.checkOutTime,
      status,
      source: "fingerprint",
      latitude: null,
      longitude: null,
      overtimeMinutes: 0,
      notes: "Sinkronisasi fingerprint read-only.",
      workScheduleSnapshot: { startTime, lateGraceMinutes, endTime: schedule?.endTime ?? null, overtimeStartTime: schedule?.overtimeStartTime ?? null, timezone: "Asia/Jakarta", source: schedule?.isWorkday ? "unit" : "legacy" },
    };
    if (existing) {
      await (this.prisma as any).gpsAttendance.update({ where: { id: existing.id }, data });
    } else {
      await (this.prisma as any).gpsAttendance.create({ data: { userId, date: day, ...data } });
    }
    return { changed: 1, skippedConflict: 0 };
  }

  async getStatus() {
    const lastRun = await (this.prisma as any).fingerprintSyncRun.findFirst({ orderBy: { startedAt: "desc" } });
    return { lastRun, readiness: this.device.getReadiness() };
  }

  async unmatched() {
    return (this.prisma as any).fingerprintAttendanceEvent.findMany({
      where: { userId: null }, select: { enrollmentId: true, localDate: true }, distinct: ["enrollmentId", "localDate"], orderBy: { localDate: "desc" }, take: 100,
    });
  }

  private isGlobalManager(principal: { roles?: unknown }): boolean {
    return Array.isArray(principal.roles) && principal.roles.some((entry: any) => entry && (
      (entry.role === "super_admin" && ["*", "auth", "core", "simpeg"].includes(entry.app)) ||
      (entry.role === "admin_kepegawaian" && ["*", "simpeg"].includes(entry.app))
    ));
  }

  private managedUnitIds(principal: { roles?: unknown }): string[] {
    return Array.isArray(principal.roles) ? [...new Set(principal.roles.flatMap((entry: any) =>
      entry && entry.app === "simpeg" && ["admin_unit", "admin_unit_nondik"].includes(entry.role) && entry.unitId ? [entry.unitId] : []
    ))] : [];
  }

  private async replayMappedEnrollment(userId: string, enrollmentId: string): Promise<void> {
    const days = await (this.prisma as any).fingerprintAttendanceEvent.findMany({
      where: { enrollmentId, userId },
      select: { localDate: true },
      distinct: ["localDate"],
      orderBy: { localDate: "asc" },
    }) as Array<{ localDate: Date }>;
    for (const { localDate } of days) await this.reconcileDay(userId, localDate);
  }

  async updateEnrollment(userId: string, fingerprintEnrollmentId: string | null, principal: { roles?: unknown }) {
    const enrollment = fingerprintEnrollmentId?.trim() || null;
    if (fingerprintEnrollmentId !== null && (!enrollment || enrollment.length > 50)) {
      throw new BadRequestException("Nomor enroll fingerprint tidak valid.");
    }
    if (!this.isGlobalManager(principal)) {
      const units = this.managedUnitIds(principal);
      const assignment = units.length ? await (this.prisma as any).employeeUnitAssignment.findFirst({
        where: { userId, unitId: { in: units }, startDate: { lte: new Date() }, OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
        select: { id: true },
      }) : null;
      if (!assignment) throw new BadRequestException("Anda tidak berwenang mengatur enroll fingerprint pegawai ini.");
    }
    if (enrollment && !(await this.authStaffCandidates.isEligible(userId))) {
      throw new BadRequestException("Akun Auth pegawai tidak aktif atau tidak memiliki peran staf.");
    }
    const profile = await (this.prisma as any).employeeProfile.upsert({
      where: { userId }, create: { userId, fingerprintEnrollmentId: enrollment, employeeType: "tetap" }, update: { fingerprintEnrollmentId: enrollment },
    });
    if (enrollment) {
      await (this.prisma as any).fingerprintAttendanceEvent.updateMany({ where: { enrollmentId: enrollment, userId: null }, data: { userId } });
      await this.replayMappedEnrollment(userId, enrollment);
    }
    return { userId: profile.userId, fingerprintEnrollmentId: profile.fingerprintEnrollmentId };
  }
}
