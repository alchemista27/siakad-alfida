import "reflect-metadata";
import assert from "node:assert/strict";
import { ForbiddenException } from "@nestjs/common";
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
    { id: "user-a", fullName: "Aisyah Tepat Waktu", unitAssignments: [{ unitId: unitA, unitName: "Unit A", role: "Staf", isPrimary: true, startDate: day("2026-01-01"), endDate: null }] },
    { id: "user-b", fullName: "Budi Terlambat", unitAssignments: [{ unitId: unitA, unitName: "Unit A", role: "Staf", isPrimary: true, startDate: day("2026-01-01"), endDate: null }] },
    { id: "user-d", fullName: "Dian Izin", unitAssignments: [{ unitId: unitA, unitName: "Unit A", role: "Staf", isPrimary: true, startDate: day("2026-01-01"), endDate: null }] },
    { id: "user-e", fullName: "Eka Cuti", unitAssignments: [{ unitId: unitA, unitName: "Unit A", role: "Staf", isPrimary: true, startDate: day("2026-01-01"), endDate: null }] },
    { id: "user-c", fullName: "Citra Unit Lain", unitAssignments: [{ unitId: unitB, unitName: "Unit B", role: "Staf", isPrimary: true, startDate: day("2026-01-01"), endDate: null }] },
  ];
  const attendances = [
    { userId: "user-a", unitId: unitA, date: day("2026-10-01"), status: "present" },
    { userId: "user-a", unitId: unitA, date: day("2026-10-30"), status: "present" },
    { userId: "user-b", unitId: unitA, date: day("2026-10-30"), status: "late" },
    { userId: "user-c", unitId: unitB, date: day("2026-10-30"), status: "present" },
  ];
  const leaves = [
    { userId: "user-d", type: "izin", status: "approved", startDate: day("2026-10-30"), endDate: day("2026-10-30") },
    { userId: "user-e", type: "cuti", status: "approved", startDate: day("2026-10-30"), endDate: day("2026-10-30") },
    { userId: "user-c", type: "cuti", status: "approved", startDate: day("2026-10-30"), endDate: day("2026-10-30") },
  ];
  const queries: any[] = [];
  const prisma: any = {
    user: {
      async findMany({ where }: any) {
        queries.push({ resource: "users", where });
        const visibleUnitIds = where.unitAssignments?.some?.unitId?.in as string[] | undefined;
        return visibleUnitIds ? users.filter((user) => user.unitAssignments.some((assignment) => visibleUnitIds.includes(assignment.unitId))) : users;
      },
    },
    gpsAttendance: {
      async findMany({ where }: any) {
        queries.push({ resource: "attendances", where });
        const visibleUnitIds = where.unitId?.in as string[] | undefined;
        const visibleUserIds = where.userId?.in as string[] | undefined;
        return attendances.filter((attendance) => (!visibleUnitIds || visibleUnitIds.includes(attendance.unitId)) && (!visibleUserIds || visibleUserIds.includes(attendance.userId)));
      },
    },
    leaveRequest: {
      async findMany({ where }: any) {
        queries.push({ resource: "leaves", where });
        const visibleUserIds = where.userId?.in as string[] | undefined;
        return leaves.filter((leave) => !visibleUserIds || visibleUserIds.includes(leave.userId));
      },
    },
  };

  const service = new AttendanceService(prisma);
  const report = await service.getAttendanceDashboardReport("2026-10", undefined, unitAdmin, new Date("2026-10-30T03:00:00.000Z"));

  assert.deepEqual(report.scope, { kind: "unit", unitIds: [unitA] }, "unit admin report must be constrained to its assigned unit");
  assert.deepEqual(report.today, { date: "2026-10-30", present: 1, late: 1, izin: 1, cuti: 1 }, "today cards must count scoped people and approved leave types");
  assert.deepEqual(report.monthly, { present: 2, late: 1, izin: 1, cuti: 1, sakit: 0 }, "monthly chart totals must include scoped attendance and approved leave days");
  assert.deepEqual(report.topOnTime, [{ userId: "user-a", fullName: "Aisyah Tepat Waktu", present: 2, late: 0 }], "top on-time employees must exclude foreign units and rank present logs");
  assert.deepEqual(queries.find((query) => query.resource === "attendances")?.where.unitId, { in: [unitA] }, "attendance query must enforce unit scope in the datastore");

  await assert.rejects(
    () => service.getAttendanceDashboardReport("2026-10", unitB, unitAdmin, new Date("2026-10-30T03:00:00.000Z")),
    (error: unknown) => error instanceof ForbiddenException,
    "unit admins must not request another unit report",
  );

  const foundationReport = await service.getAttendanceDashboardReport("2026-10", undefined, superAdmin, new Date("2026-10-30T03:00:00.000Z"));
  assert.equal(foundationReport.scope.kind, "foundation", "super admin may request the whole foundation report");
  assert.equal(foundationReport.today.present, 2, "foundation report must include all active units");

  console.log("SIMPEG attendance dashboard report contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
