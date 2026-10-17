import { ForbiddenException } from "@nestjs/common";
import { allowedUnitIds, assertUnitAccess, isSuperAdmin, type SpmbPrincipal } from "../src/common/spmb-scope-policy";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const unitA = "unit-a";
const unitB = "unit-b";
const superAdmin: SpmbPrincipal = { id: "super", roles: [{ app: "*", role: "super_admin" }] };
const adminA: SpmbPrincipal = { id: "admin-a", roles: [{ app: "spmb", role: "admin_unit", unitId: unitA }] };
const observerA: SpmbPrincipal = { id: "observer-a", roles: [{ app: "spmb", role: "observer", unitId: unitA }] };
const foreign: SpmbPrincipal = { id: "foreign", roles: [{ app: "simpeg", role: "admin_unit", unitId: unitA }] };

assert(isSuperAdmin(superAdmin), "super_admin must be recognized");
assert(allowedUnitIds(adminA, ["admin_unit"]).has(unitA), "admin unit must receive its claimed unit");
assert(!allowedUnitIds(adminA, ["admin_unit"]).has(unitB), "client-provided foreign unit cannot expand access");
assert(allowedUnitIds(observerA, ["observer"]).has(unitA), "observer must receive assigned unit");
assert(allowedUnitIds(foreign, ["admin_unit"]).size === 0, "foreign-app role must not grant SPMB units");

assertUnitAccess(superAdmin, unitB, ["admin_unit"]);
assertUnitAccess(adminA, unitA, ["admin_unit", "tim_ppdb"]);
for (const [principal, unitId, roles] of [
  [adminA, unitB, ["admin_unit"]],
  [observerA, unitB, ["observer"]],
  [foreign, unitA, ["admin_unit"]],
] as const) {
  try {
    assertUnitAccess(principal, unitId, roles);
    throw new Error(`expected scope denial for ${principal.id}`);
  } catch (error) {
    assert(error instanceof ForbiddenException, `expected ForbiddenException for ${principal.id}`);
  }
}

console.log("SPMB scope policy contract passed");
