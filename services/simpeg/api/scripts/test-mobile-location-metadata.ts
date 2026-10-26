import "reflect-metadata";
import assert from "node:assert/strict";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { GpsCheckInOutDto } from "../src/attendance/attendance.dto";
import { AttendanceService } from "../src/attendance/attendance.service";

async function main() {
  const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
  const metadata = { type: "body" as const, metatype: GpsCheckInOutDto, data: "" };
  const now = new Date("2026-10-24T01:00:00.000Z");
  const valid = { latitude: -6, longitude: 106, accuracyMeters: 10, capturedAt: now.toISOString(), mocked: false };
  assert.deepEqual(await pipe.transform(valid, metadata), valid, "mobile metadata must pass strict DTO validation");
  await assert.rejects(() => pipe.transform({ ...valid, accuracyMeters: -1 }, metadata), BadRequestException);
  await assert.rejects(() => pipe.transform({ ...valid, mocked: "false" }, metadata), BadRequestException);
  await assert.rejects(() => pipe.transform({ ...valid, arbitrary: "extra" }, metadata), BadRequestException);
  assert.deepEqual(await pipe.transform({ latitude: -6, longitude: 106 }, metadata), { latitude: -6, longitude: 106 }, "web clients remain compatible");

  const context = { date: "2026-10-24", unitId: "unit", unitName: "Unit", workday: { required: true },
    workSchedule: { startTime: "07:00", lateGraceMinutes: 0, overtimeStartTime: "17:00" },
    config: { latitude: -6, longitude: 106, radiusMeters: 30 }, attendance: null };
  let mutations = 0;
  const service = new AttendanceService({ gpsAttendance: { create: async () => { mutations++; }, updateMany: async () => { mutations++; return { count: 1 }; } } } as any);
  (service as any).getTodayAttendanceContext = async () => context;
  await assert.rejects(() => service.checkIn("user", { ...valid, mocked: true }, now), BadRequestException);
  await assert.rejects(() => service.checkIn("user", { ...valid, accuracyMeters: 40 }, now), BadRequestException);
  await assert.rejects(() => service.checkIn("user", { ...valid, capturedAt: "2026-10-24T00:59:40.000Z" }, now), BadRequestException);
  assert.equal(mutations, 0, "rejected check-ins must not write attendance");
  (service as any).getTodayAttendanceContext = async () => ({ ...context,
    attendance: { id: "record", checkInTime: new Date("2026-10-24T00:30:00.000Z"), checkOutTime: null } });
  await assert.rejects(() => service.checkOut("user", { ...valid, mocked: true }, now), BadRequestException);
  assert.equal(mutations, 0, "rejected check-outs must not write attendance");
  console.log("SIMPEG mobile location metadata API contract passed");
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
