import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { validate } from "class-validator";
import { UpsertGpsConfigDto } from "../src/attendance/attendance.dto";
import { AttendanceService } from "../src/attendance/attendance.service";

const unitId = "00000000-0000-4000-8000-000000000010";
const otherUnitId = "00000000-0000-4000-8000-000000000011";

async function main() {
  const validDto = Object.assign(new UpsertGpsConfigDto(), { unitId, latitude: -6.2, longitude: 106.8, radiusMeters: 100 });
  assert.equal((await validate(validDto)).length, 0, "valid GPS config must pass DTO validation");
  for (const invalid of [
    { unitId, latitude: 91, longitude: 106.8, radiusMeters: 100 },
    { unitId, latitude: -6.2, longitude: 181, radiusMeters: 100 },
    { unitId, latitude: -6.2, longitude: 106.8, radiusMeters: 9 },
    { unitId, latitude: -6.2, longitude: 106.8, radiusMeters: 1001 },
  ]) {
    assert.ok((await validate(Object.assign(new UpsertGpsConfigDto(), invalid))).length > 0, "GPS boundaries must be validated");
  }

  const calls: string[] = [];
  const config = { id: "config", unitId, latitude: -6.2, longitude: 106.8, radiusMeters: 100 };
  const prisma: any = {
    unit: {
      async findUnique({ where }: any) {
        calls.push(`unit:${where.id}`);
        if (where.id === unitId) return { id: unitId, name: "Unit A", code: "UA", category: "pendidikan", isActive: true };
        if (where.id === otherUnitId) return { id: otherUnitId, name: "Unit B", code: "UB", category: "nondik", isActive: false };
        return null;
      },
      async findMany() { return [
        { id: unitId, name: "Unit A", code: "UA", category: "pendidikan", isActive: true },
        { id: otherUnitId, name: "Unit B", code: "UB", category: "nondik", isActive: false },
      ]; },
    },
    gpsAttendanceConfig: {
      async upsert(input: any) { calls.push("upsert"); return { ...config, ...input.create }; },
      async findMany() { return [config, { ...config, id: "config-other", unitId: otherUnitId }]; },
    },
  };
  const service = new AttendanceService(prisma);
  const scoped = { roles: [{ app: "simpeg", role: "admin_unit", unitId }] };
  const hr = { roles: [{ app: "simpeg", role: "admin_kepegawaian" }] };

  const saved = await service.upsertGpsConfig(validDto, scoped);
  assert.equal(saved.unitId, unitId);
  assert.equal(calls.at(-1), "upsert");

  await assert.rejects(
    () => service.upsertGpsConfig({ ...validDto, unitId: otherUnitId }, scoped),
    (error: unknown) => error instanceof ForbiddenException,
    "cross-unit admin must be forbidden",
  );
  await assert.rejects(
    () => service.upsertGpsConfig(validDto, { roles: [{ app: "simpeg", role: "admin_unit" }] }),
    (error: unknown) => error instanceof ForbiddenException,
    "unscoped admin must be forbidden",
  );
  await assert.rejects(
    () => service.upsertGpsConfig({ ...validDto, unitId: "00000000-0000-4000-8000-000000000099" }, hr),
    (error: unknown) => error instanceof NotFoundException,
    "unknown unit must be rejected before upsert",
  );
  await assert.rejects(
    () => service.upsertGpsConfig({ ...validDto, unitId: otherUnitId }, hr),
    (error: unknown) => error instanceof BadRequestException,
    "inactive unit must be rejected before upsert",
  );

  const configs = await service.getGpsConfigs(scoped);
  assert.deepEqual(configs, [{ ...config, unit: { id: unitId, name: "Unit A", code: "UA", category: "pendidikan", isActive: true } }], "scoped unit admins may only read their own GPS configuration");

  console.log("GPS configuration governance contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
