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

function timestamp(value: string) {
  return new Date(value);
}

async function main() {
  const users = [
    { id: "user-a", fullName: "Aisyah Tepat Waktu", unitAssignments: [{ unitId: unitA, unitName: "Unit A", role: "Staf", isPrimary: true, startDate: day("2026-01-01"), endDate: null }] },
    { id: "user-b", fullName: "Budi Terlambat", unitAssignments: [{ unitId: unitA, unitName: "Unit A", role: "Staf", isPrimary: true, startDate: day("2026-01-01"), endDate: null }] },
    { id: "user-c", fullName: "Citra Unit Lain", unitAssignments: [{ unitId: unitB, unitName: "Unit B", role: "Staf", isPrimary: true, startDate: day("2026-01-01"), endDate: null }] },
  ];
  const attendances = [
    { userId: "user-a", unitId: unitA, date: day("2026-10-01"), status: "present", source: "fingerprint", checkInTime: timestamp("2026-10-01T08:00:00.000Z"), checkOutTime: timestamp("2026-10-01T10:00:00.000Z"), overtimeMinutes: 90 },
    { userId: "user-a", unitId: unitA, date: day("2026-10-02"), status: "present", source: "gps", checkInTime: timestamp("2026-10-02T08:00:00.000Z"), checkOutTime: timestamp("2026-10-02T09:00:00.000Z"), overtimeMinutes: 0 },
    { userId: "user-b", unitId: unitA, date: day("2026-10-02"), status: "late", source: "fingerprint", checkInTime: timestamp("2026-10-02T08:00:00.000Z"), checkOutTime: timestamp("2026-10-02T09:00:00.000Z"), overtimeMinutes: 0 },
    { userId: "user-c", unitId: unitB, date: day("2026-10-02"), status: "present", source: "fingerprint", checkInTime: timestamp("2026-10-02T08:00:00.000Z"), checkOutTime: timestamp("2026-10-02T09:00:00.000Z"), overtimeMinutes: 0 },
  ];
  const leaves = [
    { userId: "user-a", type: "izin", status: "approved", startDate: day("2026-10-05"), endDate: day("2026-10-05") },
    { userId: "user-b", type: "cuti", status: "approved", startDate: day("2026-10-05"), endDate: day("2026-10-05") },
  ];
  const prisma: any = {
    user: {
      async findMany({ where }: any) {
        const visibleUnitIds = where.unitAssignments?.some?.unitId?.in as string[] | undefined;
        return visibleUnitIds ? users.filter((user) => user.unitAssignments.some((assignment) => visibleUnitIds.includes(assignment.unitId))) : users;
      },
    },
    unit: {
      async findMany({ where }: any) {
        return [
          { id: unitA, name: "Unit A" },
          { id: unitB, name: "Unit B" },
        ].filter((unit) => where.id.in.includes(unit.id));
      },
    },
    gpsAttendance: {
      async findMany({ where }: any) {
        const visibleUnitIds = where.unitId?.in as string[] | undefined;
        const visibleUserIds = where.userId?.in as string[] | undefined;
        const source = where.source as string | undefined;
        return attendances.filter((attendance) =>
          (!visibleUnitIds || visibleUnitIds.includes(attendance.unitId)) &&
          (!visibleUserIds || visibleUserIds.includes(attendance.userId)) &&
          (!source || attendance.source === source),
        );
      },
    },
    leaveRequest: {
      async findMany({ where }: any) {
        const visibleUserIds = where.userId?.in as string[] | undefined;
        return leaves.filter((leave) => !visibleUserIds || visibleUserIds.includes(leave.userId));
      },
    },
    holiday: { async findMany() { return []; } },
    saturdayDutyAssignment: { async findMany() { return []; } },
    unitWorkSchedule: { async findMany() { return []; } },
  };
  const auth = { eligibleUserIds: async (userIds: string[]) => userIds } as any;
  const service = new AttendanceService(prisma, auth);

  const foundation = await service.getAttendanceReportExport("2026-10", undefined, superAdmin, "all", new Date("2026-10-02T03:00:00.000Z"));
  assert.equal(foundation.scope.label, "Keseluruhan Yayasan");
  assert.equal(foundation.rows.length, 3);

  const unitReport = await service.getAttendanceReportExport("2026-10", undefined, unitAdmin, "fingerprint", new Date("2026-10-02T03:00:00.000Z"));
  assert.equal(unitReport.scope.label, "Unit: Unit A");
  assert.deepEqual(unitReport.rows.map((row: any) => row.fullName), ["Aisyah Tepat Waktu", "Budi Terlambat"]);
  assert.deepEqual(unitReport.rows[0], {
    userId: "user-a",
    fullName: "Aisyah Tepat Waktu",
    present: 1,
    late: 0,
    izin: 1,
    cuti: 0,
    overtimeMinutes: 90,
    expectedWorkdays: 21,
    attendancePercentage: Number((100 / 21).toFixed(2)),
  });
  assert.equal(unitReport.rows[1].cuti, 1);
  assert.equal(unitReport.rows[1].attendancePercentage, Number((100 / 21).toFixed(2)));

  await assert.rejects(
    () => service.getAttendanceReportExport("2026-10", unitB, unitAdmin),
    (error: unknown) => error instanceof ForbiddenException,
  );

  console.log("SIMPEG attendance report export contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
