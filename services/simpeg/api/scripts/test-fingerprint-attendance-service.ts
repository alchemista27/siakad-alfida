import "reflect-metadata";
import assert from "node:assert/strict";
import { FingerprintAttendanceService } from "../src/attendance/fingerprint-attendance.service";

const day = (value: string) => new Date(`${value}T00:00:00.000Z`);

async function main() {
  const events: any[] = [];
  const attendances: any[] = [{ id: "gps-1", userId: "user-a", date: day("2026-10-05"), source: "gps", checkInTime: new Date("2026-10-05T00:00:00.000Z") }];
  const runs: any[] = [];
  const prisma: any = {
    fingerprintSyncRun: { create: async ({ data }: any) => { const run = { id: `run-${runs.length + 1}`, ...data }; runs.push(run); return run; }, update: async ({ where, data }: any) => Object.assign(runs.find(run => run.id === where.id), data), findFirst: async () => runs.at(-1) ?? null },
    employeeProfile: { findMany: async () => [{ userId: "user-a", fingerprintEnrollmentId: "0012" }] },
    fingerprintAttendanceEvent: {
      findMany: async ({ where }: any) => {
        if (where.sourceKey?.in) return events.filter(event => where.sourceKey.in.includes(event.sourceKey));
        return events.filter(event => event.userId === where.userId && event.localDate.getTime() === where.localDate.getTime());
      },
      createMany: async ({ data }: any) => { for (const row of data) if (!events.some(event => event.sourceKey === row.sourceKey)) events.push({ ...row }); return { count: data.length }; },
      updateMany: async ({ where, data }: any) => {
        const matched = events.filter((event) => event.enrollmentId === where.enrollmentId && (where.userId === undefined || event.userId === where.userId));
        matched.forEach((event) => Object.assign(event, data));
        return { count: matched.length };
      },
    },
    employeeUnitAssignment: { findFirst: async () => ({ unitId: "unit-a", unitName: "Kantor", role: "staff", isPrimary: true }) },
    gpsAttendance: {
      findUnique: async ({ where }: any) => attendances.find(row => row.userId === where.userId_date.userId && row.date.getTime() === where.userId_date.date.getTime()) ?? null,
      create: async ({ data }: any) => { const row = { id: `attendance-${attendances.length + 1}`, ...data }; attendances.push(row); return row; },
      update: async ({ where, data }: any) => Object.assign(attendances.find(row => row.id === where.id), data),
      deleteMany: async ({ where }: any) => {
        const removed = attendances.filter((row) => row.source === where.source && row.userId === where.userId && where.date.in.some((date: Date) => date.getTime() === row.date.getTime()));
        for (const row of removed) attendances.splice(attendances.indexOf(row), 1);
        return { count: removed.length };
      },
    },
    leaveRequest: { findFirst: async () => null },
    holiday: { findFirst: async () => null },
    unitWorkSchedule: { findUnique: async () => ({ isWorkday: true, startTime: "07:15", lateGraceMinutes: 0, endTime: "16:00", overtimeStartTime: "16:00" }) },
    saturdayDutyAssignment: { findUnique: async () => null },
  };
  const device = { readAttendance: async () => ({ device: { id: "solution-x100c", serial: "SN-1", firmware: null, name: null }, events: [
    { enrollmentId: "0012", occurredAt: "2026-10-05T00:10:00.000Z", punch: 0, status: 0 },
    { enrollmentId: "0099", occurredAt: "2026-10-05T00:10:00.000Z", punch: 0, status: 0 },
    { enrollmentId: "0012", occurredAt: "2026-10-10T00:10:00.000Z", punch: 0, status: 0 },
  ] }) } as any;
  let authEligible = true;
  const validatedUsers: string[][] = [];
  const auth = {
    eligibleUserIds: async (userIds: string[]) => { validatedUsers.push(userIds); return authEligible ? userIds : []; },
    isEligible: async () => authEligible,
  } as any;
  const service = new FingerprintAttendanceService(prisma, device, auth);

  const result = await service.sync({ startDate: "2026-10-01", endDate: "2026-10-31" });
  assert.equal(result.fetchedCount, 3);
  assert.equal(result.unmatchedCount, 1);
  assert.deepEqual(validatedUsers, [["user-a"]], "mapped fingerprint events must be batch-validated against Auth first");
  assert.equal(result.skippedConflict, 1, "GPS row must not be overwritten");
  assert.equal(events.length, 2, "weekend events must not be persisted");
  assert.equal(attendances.length, 1, "GPS source is preserved and no weekend record is created");
  assert.equal(runs.at(-1).status, "completed");
  assert.equal(runs.at(-1).runId, undefined, "audit row must not persist non-schema runId counters");

  attendances.push({ id: "fingerprint-old", userId: "user-a", date: day("2026-10-05"), source: "fingerprint" });
  authEligible = false;
  const afterAuthRevoked = await service.sync({ startDate: "2026-10-01", endDate: "2026-10-31" });
  assert.equal(afterAuthRevoked.matchedCount, 0, "inactive Auth account must not be matched into attendance");
  assert.equal(afterAuthRevoked.unmatchedCount, 2, "events for an inactive Auth account must remain unmatched audit data");
  assert.ok(events.every((event) => event.userId === null), "inactive Auth account must be detached from raw fingerprint events");
  assert.equal(attendances.some((attendance) => attendance.source === "fingerprint"), false, "inactive Auth account must not retain fingerprint attendance for the admin dashboard");
  await assert.rejects(
    () => service.updateEnrollment("user-a", "0012", { roles: [{ app: "simpeg", role: "admin_kepegawaian" }] }),
    /Akun Auth pegawai tidak aktif/,
  );

  console.log("SIMPEG fingerprint attendance service contract passed");
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
