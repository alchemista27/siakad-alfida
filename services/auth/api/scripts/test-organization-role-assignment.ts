import assert from "node:assert/strict";
import { validateSync } from "class-validator";

import { OrganizationRolesController } from "../src/users/organization-roles.controller";
import { UpsertOrganizationRoleDto } from "../src/users/organization-roles.dto";

async function main() {
const userId = "00000000-0000-4000-8000-000000000001";
const departmentId = "00000000-0000-4000-8000-000000000002";

for (const role of ["admin_biro", "staff"]) {
  const dto = Object.assign(new UpsertOrganizationRoleDto(), { userId, departmentId, role });
  assert.ok(validateSync(dto).length > 0, `browser-authenticated HR must not grant ${role}`);
}

const allowedDto = Object.assign(new UpsertOrganizationRoleDto(), { userId, departmentId, role: "admin_bidang" });
assert.equal(validateSync(allowedDto).length, 0, "browser-authenticated HR must retain admin_bidang grants");

let removed: unknown[] | undefined;
const controller = new OrganizationRolesController({
  upsertOrganizationRole: async () => undefined,
  removeOrganizationRole: async (...args: unknown[]) => {
    removed = args;
  },
} as any);

await (controller.remove as any)(userId, departmentId, "admin_biro");
assert.deepEqual(removed, [userId, departmentId, "admin_bidang"], "browser-authenticated HR must only revoke admin_bidang");

console.log("Auth organization role assignment contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
