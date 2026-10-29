import assert from "node:assert/strict";
import { hasSimpegAssignmentWriteAccess } from "../src/lib/simpeg-access";

assert.equal(hasSimpegAssignmentWriteAccess([]), false);
assert.equal(hasSimpegAssignmentWriteAccess([{ app: "simpeg", role: "admin_unit", unitId: "unit-a" }]), false);
assert.equal(hasSimpegAssignmentWriteAccess([{ app: "simpeg", role: "admin_bidang" }]), false);
assert.equal(hasSimpegAssignmentWriteAccess([{ app: "simpeg", role: "admin_kepegawaian" }]), true);
assert.equal(hasSimpegAssignmentWriteAccess([{ app: "*", role: "super_admin" }]), true);
assert.equal(hasSimpegAssignmentWriteAccess([{ app: "other", role: "super_admin" }]), false);

console.log("SIMPEG assignment write access contract passed");
