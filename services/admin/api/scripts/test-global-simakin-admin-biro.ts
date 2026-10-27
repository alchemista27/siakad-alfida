import assert from "node:assert/strict";
import { DEPARTMENT_SCOPED_ROLE_KEYS } from "../../../../packages/contracts/src/role-catalog";
import {
  assertDirectRoleAssignment,
  getRoleScope,
  validateRoleAssignment,
} from "../src/users/role-catalog";

function main() {
  assert.equal(
    DEPARTMENT_SCOPED_ROLE_KEYS.has("simakin:admin_biro"),
    false,
    "SIMAKIN admin_biro must be a global role, not a department-scoped role",
  );
  assert.equal(getRoleScope({ app: "simakin", role: "admin_biro" }), "generic");
  assert.doesNotThrow(() => validateRoleAssignment({ app: "simakin", role: "admin_biro" }));
  assert.doesNotThrow(() => assertDirectRoleAssignment({ app: "simakin", role: "admin_biro" }));
  assert.throws(
    () => validateRoleAssignment({ app: "simakin", role: "admin_biro", departmentId: "00000000-0000-4000-8000-000000000001" }),
    /tidak boleh memiliki unitId atau departmentId/i,
  );

  assert.equal(getRoleScope({ app: "simakin", role: "admin_bidang" }), "department");
  assert.throws(() => validateRoleAssignment({ app: "simakin", role: "admin_bidang" }), /departmentId/i);
  assert.throws(
    () => assertDirectRoleAssignment({ app: "simakin", role: "admin_bidang", departmentId: "00000000-0000-4000-8000-000000000001" }),
    /Kelola peran berscope dari menu Struktur Organisasi SIMPEG/i,
  );

  console.log("Global SIMAKIN admin_biro catalog contract passed");
}

main();
