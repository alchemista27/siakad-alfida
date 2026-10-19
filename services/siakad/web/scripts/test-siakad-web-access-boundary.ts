import assert from "node:assert/strict";
import { canAccessSiakad } from "../src/lib/siakad-access";

assert.equal(canAccessSiakad([{ app: "siakad", role: "admin_unit", unitId: "unit-pendidikan" }]), true);
assert.equal(canAccessSiakad([{ app: "simpeg", role: "admin_unit_nondik", unitId: "unit-nondik" }]), false);
assert.equal(canAccessSiakad([{ app: "siakad", role: "admin_unit_nondik", unitId: "unit-nondik" }]), false);
assert.equal(canAccessSiakad([{ app: "auth", role: "super_admin" }]), true);
assert.equal(canAccessSiakad([{ app: "simpeg", role: "admin_unit" }]), false);
assert.equal(canAccessSiakad([]), false);

console.log("SIAKAD web access-boundary contract passed");
