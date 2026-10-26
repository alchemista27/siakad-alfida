import "reflect-metadata";
import assert from "node:assert/strict";
import { BadRequestException } from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { InternalOrganizationRolesController } from "../src/users/organization-roles.controller";
import { InternalOrganizationRolesGuard } from "../src/users/internal-organization-roles.guard";

const userId = "00000000-0000-4000-8000-000000000001";
const scopeId = "00000000-0000-4000-8000-000000000002";

const unitAdmin = {
  userId,
  scope: "unit" as const,
  unitId: scopeId,
  app: "simpeg" as const,
  role: "admin_unit" as const,
};
const nondikAdmin = { ...unitAdmin, role: "admin_unit_nondik" as const };
const siakadAdmin = { ...unitAdmin, app: "siakad" as const, role: "admin_unit" as const };
const bidangAdmin = {
  userId,
  scope: "department" as const,
  departmentId: scopeId,
  app: "simakin" as const,
  role: "admin_bidang" as const,
};
const biroAdmin = { ...bidangAdmin, role: "admin_biro" as const };

async function main() {
  const calls: Array<[string, unknown, unknown?]> = [];
  const controller = new InternalOrganizationRolesController({
    upsertOrganizationRole: async (input: unknown) => {
      calls.push(["upsertOrganizationRole", input]);
      return { id: `role-${calls.length}` };
    },
    removeOrganizationRole: async (input: unknown, options: unknown) => {
      calls.push(["removeOrganizationRole", input, options]);
      return { deleted: false };
    },
  } as any);

  assert.ok(
    Reflect.getMetadata(GUARDS_METADATA, InternalOrganizationRolesController).includes(InternalOrganizationRolesGuard),
    "the internal broker must require the service-token guard",
  );
  assert.equal(typeof (controller as any).removeScoped, "function", "generic internal revoke route must exist");

  for (const input of [unitAdmin, nondikAdmin, siakadAdmin, bidangAdmin, biroAdmin]) {
    await controller.upsert(input);
    assert.deepEqual(calls.at(-1), ["upsertOrganizationRole", input]);
    await (controller as any).removeScoped(input);
    assert.deepEqual(calls.at(-1), ["removeOrganizationRole", input, { idempotent: true }]);
  }

  for (const invalid of [
    { ...unitAdmin, unitId: "not-a-uuid" },
    { ...unitAdmin, app: "other" },
    { ...bidangAdmin, role: "admin_unit" },
  ]) {
    assert.throws(() => controller.upsert(invalid), BadRequestException);
  }
  assert.equal(calls.length, 10, "invalid inputs must not call UsersService");

  console.log("Internal organization role broker contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
