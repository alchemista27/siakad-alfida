import assert from "node:assert/strict";
import { buildUnitAdminAudit } from "./lib/unit-admin-audit";

const report = buildUnitAdminAudit({
  units: [
    { id: "u-edu-ok", name: "SDIT Contoh", code: "SDC", category: "pendidikan", isActive: true },
    { id: "u-none", name: "SMPIT Kosong", code: "SMK", category: "pendidikan", isActive: true },
    { id: "u-local", name: "Kantor Lokal", code: "KTL", category: "nondik", isActive: true },
    { id: "u-auth", name: "Asrama Auth", code: "ASM", category: "nondik", isActive: true },
    { id: "u-split", name: "Unit Tidak Sama", code: "UTS", category: "pendidikan", isActive: true },
    { id: "u-off", name: "Unit Nonaktif", code: "OFF", category: "pendidikan", isActive: false },
  ],
  simpegAssignments: [
    { unitId: "u-edu-ok", userId: "person-a", app: "simpeg", role: "admin_unit", isActive: true },
    { unitId: "u-local", userId: "person-b", app: "simpeg", role: "admin_unit_nondik", isActive: true },
    { unitId: "u-split", userId: "person-c", app: "simpeg", role: "admin_unit", isActive: true },
  ],
  authAssignments: [
    { unitId: "u-edu-ok", userId: "person-a", app: "simpeg", role: "admin_unit" },
    { unitId: "u-auth", userId: "person-d", app: "simpeg", role: "admin_unit_nondik" },
    { unitId: "u-split", userId: "person-e", app: "simpeg", role: "admin_unit" },
  ],
  authUsers: [
    { id: "person-a", fullName: "Septian Jauhariansyah", email: "septian@example.test", username: "septian", isActive: true, createdAt: new Date("2026-01-01T00:00:00.000Z") },
    { id: "person-z", fullName: "  SEPTIAN   JAUHARIANSYAH ", email: "septian.2@example.test", username: null, isActive: false, createdAt: new Date("2026-01-02T00:00:00.000Z") },
  ],
});

assert.deepEqual(report.units.missingEverywhere.map((unit) => unit.code), ["SMK"]);
assert.deepEqual(report.units.simpegOnly.map((unit) => unit.code), ["KTL"]);
assert.deepEqual(report.units.authOnly.map((unit) => unit.code), ["ASM"]);
assert.deepEqual(report.units.identityMismatch.map((unit) => unit.code), ["UTS"]);
assert.equal(report.units.healthyCount, 1);
assert.equal(report.units.inactiveUnitCount, 1);
assert.equal(report.septianJauhariansyah.authIdentityCount, 2);
assert.equal(report.septianJauhariansyah.activeIdentityCount, 1);
assert.equal(report.septianJauhariansyah.accounts.every((account) => account.email.includes("***@")), true);
console.log("Unit admin audit contract passed");
