import "reflect-metadata";
import assert from "node:assert/strict";
import { FingerprintAttendanceService } from "../src/attendance/fingerprint-attendance.service";

async function main() {
  const day = new Date("2026-10-01T00:00:00.000Z");
  const attendanceWrites: any[] = [];
  const rawEvents = [
    { userId: "employee-1", localDate: day, occurredAt: new Date("2026-10-01T00:03:00.000Z"), enrollmentId: "26", punch: 0, status: 1 },
    { userId: "employee-1", localDate: day, occurredAt: new Date("2026-10-01T08:11:00.000Z"), enrollmentId: "26", punch: 0, status: 1 },
  ];
  const prisma = {
    employeeProfile: {
      upsert: async () => ({ userId: "employee-1", fingerprintEnrollmentId: "26" }),
    },
    fingerprintAttendanceEvent: {
      updateMany: async () => ({ count: 2 }),
      findMany: async (args: any) => {
        if (args?.select?.localDate && args?.distinct?.includes("localDate")) return [{ localDate: day }];
        return rawEvents;
      },
    },
    employeeUnitAssignment: {
      findFirst: async () => ({ unitId: "unit-1" }),
    },
    leaveRequest: { findFirst: async () => null },
    holiday: { findFirst: async () => null },
    saturdayDutyAssignment: { findUnique: async () => null },
    unitWorkSchedule: { findUnique: async () => ({ isWorkday: true, startTime: "07:15", lateGraceMinutes: 0, endTime: "16:00", overtimeStartTime: null }) },
    gpsAttendance: {
      findUnique: async () => null,
      create: async (args: any) => { attendanceWrites.push(args.data); return args.data; },
      update: async () => { throw new Error("unexpected update"); },
    },
  } as any;
  const service = new FingerprintAttendanceService(
    prisma,
    {} as any,
    { isEligible: async () => true } as any,
  );

  await service.updateEnrollment("employee-1", "26", {
    roles: [{ app: "simpeg", role: "admin_kepegawaian" }],
  });

  assert.equal(attendanceWrites.length, 1, "mapping an imported enrollment must replay its historical day into one report row");
  assert.equal(attendanceWrites[0].userId, "employee-1");
  assert.equal(attendanceWrites[0].date.toISOString(), day.toISOString());
  assert.equal(attendanceWrites[0].source, "fingerprint");
  assert.equal(attendanceWrites[0].status, "present");
  console.log("SIMPEG fingerprint enrollment replay contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
