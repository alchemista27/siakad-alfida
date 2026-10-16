import assert from "node:assert/strict";

import { validateInternalOrganizationRoleInput } from "../src/users/internal-organization-role.policy";

const valid = validateInternalOrganizationRoleInput({ userId: "00000000-0000-4000-8000-000000000001", departmentId: "00000000-0000-4000-8000-000000000002", role: "admin_biro" });
assert.equal(valid.role, "admin_biro");
assert.throws(() => validateInternalOrganizationRoleInput({ userId: valid.userId, departmentId: valid.departmentId, role: "admin_bidang" }), /admin_biro/);
console.log("Internal organization role broker contract passed");
