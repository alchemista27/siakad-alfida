import assert from "node:assert/strict";
import { BadRequestException } from "@nestjs/common";
import { AttendanceService } from "../src/attendance/attendance.service";

async function main() {
  const now = new Date("2026-10-26T01:00:00.000Z");
  const later = new Date("2026-10-26T02:00:00.000Z");
  const validLocation = { latitude: 0, longitude: 0, accuracyMeters: 5, capturedAt: now.toISOString(), mocked: false };
  const outsideRadiusLocation = { ...validLocation, latitude: 0.01 };
  let saved: any = null;
  let context: any = {
    date: "2026-10-26",
    unitId: "unit-a",
    unitName: "Unit A",
    config: { latitude: 0, longitude: 0, radiusMeters: 50 },
    workday: { required: true },
    workSchedule: { startTime: "07:00", lateGraceMinutes: 0, endTime: "16:00", overtimeStartTime: "17:00" },
    attendance: null,
  };

  const service = new AttendanceService({
    gpsAttendance: {
      create: async ({ data }: any) => {
        saved = { id: "attendance-a", ...data, checkOutTime: null };
        return saved;
      },
      updateMany: async ({ where, data }: any) => {
        if (!saved || saved.id !== where.id || saved.checkOutTime !== null) return { count: 0 };
        saved = { ...saved, ...data };
        return { count: 1 };
      },
      findUnique: async () => saved,
    },
  } as any);
  (service as any).getTodayAttendanceContext = async () => context;

  const checkInResult = await service.checkIn("pegawai-a", validLocation, now);
  assert.equal(checkInResult.distanceMeters, 0, "check-in response must expose server-computed distance");

  context = { ...context, attendance: saved };
  const checkOutResult = await service.checkOut("pegawai-a", { ...validLocation, capturedAt: later.toISOString() }, later);
  assert.equal(checkOutResult.distanceMeters, 0, "check-out response must expose server-computed distance");

  context = { ...context, attendance: null };
  await assert.rejects(
    () => service.checkIn("pegawai-b", outsideRadiusLocation, now),
    (error: unknown) => error instanceof BadRequestException && error.message.includes("luar jangkauan lokasi unit"),
  );

  console.log("SIMPEG attendance distance response contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
