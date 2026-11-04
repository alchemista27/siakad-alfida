import "reflect-metadata";
import assert from "node:assert/strict";
import { BadRequestException } from "@nestjs/common";
import { AttendanceService, gpsAttendanceEnabled } from "../src/attendance/attendance.service";

async function main() {
  const original = process.env.SIMPEG_GPS_ATTENDANCE_ENABLED;
  try {
    delete process.env.SIMPEG_GPS_ATTENDANCE_ENABLED;
    assert.equal(gpsAttendanceEnabled(), false, "GPS must default to disabled when its feature flag is absent");

    const service = new AttendanceService({} as any, {} as any);
    await assert.rejects(
      () => service.checkIn("user-id", { latitude: -6.2, longitude: 106.8 }),
      (error: unknown) => error instanceof BadRequestException && error.message === "Presensi GPS belum diaktifkan.",
      "disabled GPS must reject direct check-in calls before querying or writing attendance",
    );

    process.env.SIMPEG_GPS_ATTENDANCE_ENABLED = "true";
    assert.equal(gpsAttendanceEnabled(), true, "GPS must only be enabled by the explicit true value");
    process.env.SIMPEG_GPS_ATTENDANCE_ENABLED = "TRUE";
    assert.equal(gpsAttendanceEnabled(), false, "GPS flag parsing must fail closed");
  } finally {
    if (original === undefined) delete process.env.SIMPEG_GPS_ATTENDANCE_ENABLED;
    else process.env.SIMPEG_GPS_ATTENDANCE_ENABLED = original;
  }

  console.log("SIMPEG GPS disabled contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
