import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { validate } from "class-validator";
import { CreateUnitDto, UpdateUnitDto } from "../src/units/units.dto";
import { UnitsService } from "../src/units/units.service";

const unitId = "00000000-0000-4000-8000-000000000010";
const otherUnitId = "00000000-0000-4000-8000-000000000011";
const hrPrincipal = { roles: [{ app: "simpeg", role: "admin_kepegawaian" }] };
const scopedPrincipal = { roles: [{ app: "simpeg", role: "admin_unit", unitId }] };

async function main() {
  const createDto = Object.assign(new CreateUnitDto(), {
    name: "  Unit Pendidikan  ",
    code: "  up-01 ",
    category: "pendidikan",
  });
  assert.equal((await validate(createDto)).length, 0, "valid unit input must pass DTO validation");

  const invalidCreate = Object.assign(new CreateUnitDto(), { name: "U", code: "X", category: "other" });
  assert.ok((await validate(invalidCreate)).length > 0, "invalid category and undersized fields must fail DTO validation");

  const invalidUpdate = Object.assign(new UpdateUnitDto(), { category: "other" });
  assert.ok((await validate(invalidUpdate)).length > 0, "unit updates must restrict category");

  const created: any[] = [];
  const deleted: any[] = [];
  const prisma: any = {
    unit: {
      async create(input: any) { created.push(input); return { id: unitId, ...input.data }; },
      async findUnique({ where }: any) {
        if (where.id === otherUnitId) return { id: otherUnitId, name: "Other", code: "OTHER", isActive: true, category: "pendidikan" };
        return { id: unitId, name: "Unit Pendidikan", code: "UP-01", isActive: true, category: "pendidikan" };
      },
      async findMany(input: any) { return [{ id: unitId }, { id: otherUnitId, ...input }]; },
      async delete(input: any) { deleted.push(input); return { id: input.where.id }; },
      async update() { throw new Error("delete must not archive"); },
    },
    employeeUnitAssignment: { async count() { return 0; } },
    unitAdminAssignment: { async count() { return 0; } },
    gpsAttendanceConfig: { async count() { return 0; } },
    gpsAttendance: { async count() { return 0; } },
    holiday: { async count() { return 0; } },
  };
  const service = new UnitsService(prisma);

  await service.create({ name: "  Unit Pendidikan  ", code: "  up-01 ", category: "pendidikan" });
  assert.deepEqual(created[0].data, {
    name: "Unit Pendidikan",
    code: "UP-01",
    category: "pendidikan",
    address: null,
    isActive: true,
  });

  await service.remove(unitId, hrPrincipal);
  assert.deepEqual(deleted, [{ where: { id: unitId } }], "unused units must be hard deleted");

  await assert.rejects(
    () => service.remove(unitId, scopedPrincipal),
    (error: unknown) => error instanceof ForbiddenException,
    "scoped unit admin must not delete a unit",
  );

  const dependentPrisma = {
    ...prisma,
    employeeUnitAssignment: { async count() { return 1; } },
  };
  await assert.rejects(
    () => new UnitsService(dependentPrisma as any).remove(unitId, hrPrincipal),
    (error: unknown) => error instanceof BadRequestException && /tidak dapat dihapus/.test(error.message),
    "dependent unit must not be hard deleted",
  );

  const unitAdminDependentPrisma = {
    ...prisma,
    unitAdminAssignment: { async count() { return 1; } },
  };
  await assert.rejects(
    () => new UnitsService(unitAdminDependentPrisma as any).remove(unitId, hrPrincipal),
    (error: unknown) => error instanceof BadRequestException && /tidak dapat dihapus/.test(error.message),
    "an active unit administrator must block unit deletion",
  );

  const own = await service.findOne(unitId, scopedPrincipal);
  assert.equal(own.id, unitId);
  await assert.rejects(
    () => service.findOne(otherUnitId, scopedPrincipal),
    (error: unknown) => error instanceof ForbiddenException,
    "scoped unit admin must not read another unit",
  );

  console.log("SIMPEG unit governance contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
