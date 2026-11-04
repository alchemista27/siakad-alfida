import "reflect-metadata";
import assert from "node:assert/strict";
import { AttendanceService } from "../src/attendance/attendance.service";

async function main() {
  const original = process.env.SIMPEG_GPS_ATTENDANCE_ENABLED;
  try {
    const prisma = {
      user: { async findMany() { return []; } },
      gpsAttendance: { async findMany() { return []; } },
      leaveRequest: { async findMany() { return []; } },
    } as any;
    const service = new AttendanceService(prisma, { eligibleUserIds: async () => [] } as any);

    delete process.env.SIMPEG_GPS_ATTENDANCE_ENABLED;
    const unavailable = await service.getAttendanceDashboardReport("2026-10", undefined, { roles: [{ app: "simpeg", role: "super_admin" }] });
    assert.equal(unavailable.sources.gps.status, "unavailable");

    process.env.SIMPEG_GPS_ATTENDANCE_ENABLED = "true";
    const active = await service.getAttendanceDashboardReport("2026-10", undefined, { roles: [{ app: "simpeg", role: "super_admin" }] });
    assert.equal(active.sources.gps.status, "active");
  } finally {
    if (original === undefined) delete process.env.SIMPEG_GPS_ATTENDANCE_ENABLED;
    else process.env.SIMPEG_GPS_ATTENDANCE_ENABLED = original;
  }
  console.log("SIMPEG GPS attendance source status contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
