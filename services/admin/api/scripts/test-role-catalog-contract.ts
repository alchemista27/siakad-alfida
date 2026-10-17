import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { APP_ROLES } from "../../../../packages/contracts/src/roles";
import {
  DEPARTMENT_SCOPED_ROLE_KEYS,
  ROLE_CATALOG,
  UNIT_SCOPED_ROLE_KEYS,
} from "../../../../packages/contracts/src/role-catalog";
import {
  assertDirectRoleAssignment,
  getRoleScope,
  validateRoleAssignment,
} from "../src/users/role-catalog";

function roleKey(app: string, role: string) {
  return `${app}:${role}`;
}

function main() {
  const source = readFileSync(join(process.cwd(), "src/users/role-catalog.ts"), "utf8");
  assert.match(source, /from\s+["']@alfida\/contracts["']/);
  assert.doesNotMatch(source, /export const ROLE_CATALOG\s*=/);

  for (const [app, roles] of Object.entries(ROLE_CATALOG)) {
    assert(roles.length > 0, `${app} must expose at least one role`);
    assert.equal(new Set(roles).size, roles.length, `${app} must not repeat a role`);

    for (const role of roles) {
      const scope = getRoleScope({ app, role });
      const scopeInput = scope === "unit"
        ? { unitId: "00000000-0000-4000-8000-000000000001" }
        : scope === "department"
          ? { departmentId: "00000000-0000-4000-8000-000000000002" }
          : {};
      assert.doesNotThrow(
        () => validateRoleAssignment({ app, role, ...scopeInput }),
        `${app}:${role} must be valid in the Admin API`,
      );
    }
  }

  assert.deepEqual(
    ROLE_CATALOG.siakad,
    APP_ROLES.siakad,
    "SIAKAD roles must remain aligned with the contracts role taxonomy",
  );

  for (const key of UNIT_SCOPED_ROLE_KEYS) {
    const [app, role] = key.split(":");
    assert.equal(getRoleScope({ app, role }), "unit", `${key} must be unit scoped`);
    assert.throws(
      () => assertDirectRoleAssignment({ app, role, unitId: "00000000-0000-4000-8000-000000000001" }),
      /Kelola peran berscope dari menu Struktur Organisasi SIMPEG/i,
      `${key} must be rejected from direct assignment`,
    );
  }

  for (const key of DEPARTMENT_SCOPED_ROLE_KEYS) {
    const [app, role] = key.split(":");
    assert.equal(getRoleScope({ app, role }), "department", `${key} must be department scoped`);
    assert.throws(
      () => assertDirectRoleAssignment({ app, role, departmentId: "00000000-0000-4000-8000-000000000002" }),
      /Kelola peran berscope dari menu Struktur Organisasi SIMPEG/i,
      `${key} must be rejected from direct assignment`,
    );
  }

  const allRoleKeys = Object.entries(ROLE_CATALOG).flatMap(([app, roles]) => roles.map((role) => roleKey(app, role)));
  assert.equal(new Set(allRoleKeys).size, allRoleKeys.length, "catalog must not repeat an app/role pair");

  console.log("Admin role catalog contract passed");
}

main();
