import "reflect-metadata";
import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { AttendanceService } from "../src/attendance/attendance.service";

const unitA = "00000000-0000-4000-8000-000000000010";
const unitB = "00000000-0000-4000-8000-000000000011";
const unitAdmin = { roles: [{ app: "simpeg", role: "admin_unit", unitId: unitA }] };
const superAdmin = { roles: [{ app: "simpeg", role: "super_admin" }] };

function day(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  const users = [
    { id: "fingerprint-user", fullName: "Aisyah Fingerprint", unitAssignments: [{ unitId: unitA, unitName: "Unit A", role: "Staf", isPrimary: true, startDate: day("2026-01-01"), endDate: null }] },
    { id: "gps-user", fullName: "Budi Riwayat GPS", unitAssignments: [{ unitId: unitA, unitName: "Unit A", role: "Staf", isPrimary: true, startDate: day("2026-01-01"), endDate: null }] },
    { id: "backfill-user", fullName: "Citra Backfill", unitAssignments: [{ unitId: unitA, unitName: "Unit A", role: "Staf", isPrimary: true, startDate: day("2026-01-01"), endDate: null }] },
    { id: "foreign-user", fullName: "Dian Unit Lain", unitAssignments: [{ unitId: unitB, unitName: "Unit B", role: "Staf", isPrimary: true, startDate: day("2026-01-01"), endDate: null }] },
    { id: "inactive-auth-user", fullName: "Eka Tidak Eligible", unitAssignments: [{ unitId: unitA, unitName: "Unit A", role: "Staf", isPrimary: true, startDate: day("2026-01-01"), endDate: null }] },
  ];
  const attendances = [
    { userId: "fingerprint-user", unitId: unitA, date: day("2026-10-01"), status: "present", source: "fingerprint" },
    { userId: "fingerprint-user", unitId: unitA, date: day("2026-10-30"), status: "present", source: "fingerprint" },
    { userId: "gps-user", unitId: unitA, date: day("2026-10-30"), status: "late", source: "gps" },
    { userId: "backfill-user", unitId: unitA, date: day("2026-10-30"), status: "present", source: "backfill" },
    { userId: "foreign-user", unitId: unitB, date: day("2026-10-30"), status: "present", source: "fingerprint" },
    { userId: "inactive-auth-user", unitId: unitA, date: day("2026-10-30"), status: "late", source: "fingerprint" },
  ];
  const prisma: any = {
    user: {
      async findMany({ where }: any) {
        const visibleUnitIds = where.unitAssignments?.some?.unitId?.in as string[] | undefined;
        return visibleUnitIds ? users.filter((user) => user.unitAssignments.some((assignment) => visibleUnitIds.includes(assignment.unitId))) : users;
      },
    },
    gpsAttendance: {
      async findMany({ where }: any) {
        const visibleUnitIds = where.unitId?.in as string[] | undefined;
        const visibleUserIds = where.userId?.in as string[] | undefined;
        const source = where.source as string | undefined;
        return attendances.filter((attendance) =>
          (!visibleUnitIds || visibleUnitIds.includes(attendance.unitId))
          && (!visibleUserIds || visibleUserIds.includes(attendance.userId))
          && (!source || attendance.source === source),
        );
      },
    },
    leaveRequest: { async findMany() { return []; } },
  };
  const auth = { eligibleUserIds: async (userIds: string[]) => userIds.filter((id) => id !== "inactive-auth-user") } as any;
  const service = new AttendanceService(prisma, auth);
  const now = new Date("2026-10-30T03:00:00.000Z");

  const all = await service.getAttendanceDashboardReport("2026-10", undefined, unitAdmin, now, "all");
  assert.equal(all.sourceFilter, "all", "report must identify the selected all-sources filter");
  assert.deepEqual(all.sources, {
    fingerprint: { status: "active", attendanceRecords: 2 },
    gps: { status: "unavailable", attendanceRecords: 1 },
    backfill: { status: "administrative", attendanceRecords: 1 },
  }, "source breakdown must be scoped to Auth-eligible staff and the selected unit");
  assert.deepEqual(all.monthly, { present: 3, late: 1, izin: 0, cuti: 0, sakit: 0 }, "all sources must contribute to attendance totals");

  const fingerprint = await service.getAttendanceDashboardReport("2026-10", undefined, unitAdmin, now, "fingerprint");
  assert.equal(fingerprint.sourceFilter, "fingerprint");
  assert.deepEqual(fingerprint.today, { date: "2026-10-30", present: 1, late: 0, izin: 0, cuti: 0 }, "fingerprint filter must affect present/late counts only");
  assert.deepEqual(fingerprint.monthly, { present: 2, late: 0, izin: 0, cuti: 0, sakit: 0 });
  assert.deepEqual(fingerprint.topOnTime, [{ userId: "fingerprint-user", fullName: "Aisyah Fingerprint", present: 2, late: 0 }]);

  await assert.rejects(
    () => service.getAttendanceDashboardReport("2026-10", undefined, unitAdmin, now, "invalid" as any),
    (error: unknown) => error instanceof BadRequestException,
    "unknown source filter must be rejected",
  );
  await assert.rejects(
    () => service.getAttendanceDashboardReport("2026-10", unitB, unitAdmin, now, "all"),
    (error: unknown) => error instanceof ForbiddenException,
    "source filters must not bypass unit scoping",
  );

  const foundation = await service.getAttendanceDashboardReport("2026-10", undefined, superAdmin, now, "backfill");
  assert.equal(foundation.scope.kind, "foundation");
  assert.equal(foundation.monthly.present, 1, "global report must filter backfill independently");

  console.log("SIMPEG attendance dashboard source contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
