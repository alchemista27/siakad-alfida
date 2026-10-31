import "reflect-metadata";
import assert from "node:assert/strict";
import { GUARDS_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { ForbiddenException } from "@nestjs/common";
import { SimpegRolesGuard, SIMPEG_ROLES_KEY } from "../src/common/guards/simpeg-roles.guard";
import { EmployeesController } from "../src/employees/employees.controller";
import { EmployeesService } from "../src/employees/employees.service";

async function main() {
  const prismaCalls: any[] = [];
  const authCalls: string[] = [];
  const staff = [{ id: "employee-1", fullName: "Alice Guru", email: "alice@example.org", avatarUrl: null }];
  const prisma = {
    user: {
      findMany: async (query: any) => {
        prismaCalls.push(query);
        return [];
      },
    },
  };
  const authStaffCandidates = {
    async find(search: string) {
      authCalls.push(search);
      return staff;
    },
  };
  const service = new EmployeesService(prisma as any, authStaffCandidates as any);
  const controller = new EmployeesController(service);

  assert.equal(typeof controller.suggestions, "function", "GET /employees/suggestions must exist");
  assert.equal(Reflect.getMetadata(PATH_METADATA, controller.suggestions), "suggestions");
  assert.ok(Reflect.getMetadata(GUARDS_METADATA, EmployeesController).includes(ServiceJwtAuthGuard));
  assert.ok(Reflect.getMetadata(GUARDS_METADATA, controller.suggestions).includes(SimpegRolesGuard));
  assert.deepEqual(Reflect.getMetadata(SIMPEG_ROLES_KEY, controller.suggestions), [
    "super_admin", "admin_kepegawaian", "admin_unit", "admin_unit_nondik",
  ]);

  const result = await controller.suggestions(" Alice ", undefined, { user: { roles: [{ app: "simpeg", role: "admin_kepegawaian" }] } });
  assert.deepEqual(result, staff, "suggestions must return Auth-verified staff candidates only");
  assert.deepEqual(authCalls, ["Alice"]);
  assert.equal(prismaCalls.length, 0, "suggestions must not query SIMPEG's role-unaware user projection");

  await service.suggestions("x".repeat(101), undefined, { roles: [{ app: "auth", role: "super_admin" }] });
  assert.equal(authCalls[1]?.length, 100, "search must be bounded before calling Auth");
  assert.deepEqual(await service.suggestions("   ", undefined, { roles: [{ app: "simpeg", role: "admin_kepegawaian" }] }), []);
  assert.equal(authCalls.length, 2, "blank searches must not call Auth");

  const unitId = "00000000-0000-4000-8000-000000000010";
  const otherUnitId = "00000000-0000-4000-8000-000000000011";
  for (const role of ["admin_unit", "admin_unit_nondik"]) {
    const principal = { roles: [{ app: "simpeg", role, unitId }] };
    await controller.suggestions("alice", unitId, { user: principal });
    await assert.rejects(() => service.suggestions("alice", undefined, principal), ForbiddenException);
    await assert.rejects(() => service.suggestions("alice", otherUnitId, principal), ForbiddenException);
  }
  const beforeDenials = authCalls.length;
  for (const roles of [
    [],
    [{ app: "simakin", role: "admin_bidang", departmentId: "dept" }],
    [{ app: "spmb", role: "admin_unit", unitId }],
    [{ app: "simpeg", role: "admin_unit" }],
    [{ app: "other", role: "super_admin" }],
  ]) {
    await assert.rejects(() => service.suggestions("alice", unitId, { roles }), ForbiddenException);
  }
  assert.equal(authCalls.length, beforeDenials, "unauthorized requests must never call Auth");
  console.log("Employee suggestions contract passed");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
