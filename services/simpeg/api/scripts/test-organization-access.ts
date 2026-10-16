import assert from "node:assert/strict";
import {
  canManageUnit,
  deriveUnitAdminRole,
  isAllowedUnitAdminApp,
} from "../src/common/organization-access.policy";

const unitId = "00000000-0000-4000-8000-000000000010";
const otherUnitId = "00000000-0000-4000-8000-000000000011";

assert.equal(canManageUnit([{ app: "*", role: "super_admin" }], unitId), true);
assert.equal(canManageUnit([{ app: "simpeg", role: "admin_kepegawaian" }], unitId), true);
assert.equal(canManageUnit([{ app: "simpeg", role: "admin_unit", unitId }], unitId), true);
assert.equal(canManageUnit([{ app: "simpeg", role: "admin_unit_nondik", unitId }], unitId), true);
assert.equal(canManageUnit([{ app: "simpeg", role: "admin_unit", unitId: otherUnitId }], unitId), false);
assert.equal(canManageUnit([{ app: "simpeg", role: "admin_unit" }], unitId), false);
assert.equal(canManageUnit([{ app: "spmb", role: "admin_unit", unitId }], unitId), false);
assert.equal(deriveUnitAdminRole("pendidikan"), "admin_unit");
assert.equal(deriveUnitAdminRole("nondik"), "admin_unit_nondik");
assert.equal(isAllowedUnitAdminApp("siakad", "pendidikan"), true);
assert.equal(isAllowedUnitAdminApp("spmb", "pendidikan"), true);
assert.equal(isAllowedUnitAdminApp("simpeg", "nondik"), true);
assert.equal(isAllowedUnitAdminApp("siakad", "nondik"), false);

console.log("Organization access contract passed");
