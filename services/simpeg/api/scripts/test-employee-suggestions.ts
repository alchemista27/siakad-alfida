import "reflect-metadata";
import assert from "node:assert/strict";
import { GUARDS_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { ForbiddenException } from "@nestjs/common";
import { SimpegRolesGuard, SIMPEG_ROLES_KEY } from "../src/common/guards/simpeg-roles.guard";
import { EmployeesController } from "../src/employees/employees.controller";
import { EmployeesService } from "../src/employees/employees.service";

async function main() {
  const calls: any[] = [];
  const prisma = { user: { findMany: async (query: any) => { calls.push(query); return [{ id: "employee-1", fullName: "Alice", email: "alice@example.org" }]; } } };
  const service = new EmployeesService(prisma as any);
  const controller = new EmployeesController(service);

  assert.equal(typeof controller.suggestions, "function", "GET /employees/suggestions must exist");
  assert.equal(Reflect.getMetadata(PATH_METADATA, controller.suggestions), "suggestions");
  assert.ok(Reflect.getMetadata(GUARDS_METADATA, EmployeesController).includes(ServiceJwtAuthGuard));
  assert.ok(Reflect.getMetadata(GUARDS_METADATA, controller.suggestions).includes(SimpegRolesGuard));
  assert.deepEqual(Reflect.getMetadata(SIMPEG_ROLES_KEY, controller.suggestions), [
    "super_admin", "admin_kepegawaian", "admin_unit", "admin_unit_nondik",
  ]);
  const result = await controller.suggestions("a", undefined, { user: { roles: [{ app: "simpeg", role: "admin_kepegawaian" }] } });
  assert.deepEqual(result, [{ id: "employee-1", fullName: "Alice", email: "alice@example.org" }]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].where.isActive, true);
  assert.equal(calls[0].take, 10);
  assert.deepEqual(calls[0].where.OR, [
    { fullName: { contains: "a", mode: "insensitive" } },
    { email: { contains: "a", mode: "insensitive" } },
    { username: { contains: "a", mode: "insensitive" } },
    { profile: { is: { nip: { contains: "a", mode: "insensitive" } } } },
  ]);
  assert.deepEqual(calls[0].select, { id: true, fullName: true, email: true, username: true, avatarUrl: true });
  assert.equal(calls[0].include, undefined);

  // One character is enough; whitespace alone never triggers an unbounded query.
  await service.suggestions(" A ", undefined, { roles: [{ app: "auth", role: "super_admin" }] });
  assert.equal(calls[1].where.OR[0].fullName.contains, "A");
  assert.equal(calls[1].where.OR[0].fullName.mode, "insensitive");
  assert.deepEqual(await service.suggestions("   ", undefined, { roles: [{ app: "simpeg", role: "admin_kepegawaian" }] }), []);
  assert.equal(calls.length, 2);

  const unitId = "00000000-0000-4000-8000-000000000010";
  const otherUnitId = "00000000-0000-4000-8000-000000000011";
  for (const role of ["admin_unit", "admin_unit_nondik"]) {
    const principal = { roles: [{ app: "simpeg", role, unitId }] };
    await controller.suggestions("a", unitId, { user: principal });
    await assert.rejects(() => service.suggestions("a", undefined, principal), ForbiddenException);
    await assert.rejects(() => service.suggestions("a", otherUnitId, principal), ForbiddenException);
  }
  const beforeDenials = calls.length;
  for (const roles of [
    [],
    [{ app: "simakin", role: "admin_bidang", departmentId: "dept" }],
    [{ app: "spmb", role: "admin_unit", unitId }],
    [{ app: "simpeg", role: "admin_unit" }],
    [{ app: "other", role: "super_admin" }],
  ]) {
    await assert.rejects(() => service.suggestions("a", unitId, { roles }), ForbiddenException);
  }
  assert.equal(calls.length, beforeDenials, "unauthorized requests must never query users");
  console.log("Employee suggestions contract passed");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
