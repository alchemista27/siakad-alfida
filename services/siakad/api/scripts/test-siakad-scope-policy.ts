import { ForbiddenException } from "@nestjs/common";
import {
  allowedUnitIds,
  assertHomeroomAccess,
  assertParentEnrollmentAccess,
  assertTeacherAssignmentAccess,
  assertUnitAccess,
  isSuperAdmin,
  type SiakadPrincipal,
} from "../src/common/siakad-scope-policy";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function expectForbidden(label: string, action: () => void) {
  try {
    action();
    throw new Error(`${label}: expected access to be denied`);
  } catch (error) {
    if (!(error instanceof ForbiddenException)) throw error;
  }
}

const unitA = "unit-a";
const unitB = "unit-b";
const superAdmin: SiakadPrincipal = { id: "super", roles: [{ app: "*", role: "super_admin" }] };
const adminA: SiakadPrincipal = { id: "admin-a", roles: [{ app: "siakad", role: "admin_unit", unitId: unitA }] };
const teacherA: SiakadPrincipal = { id: "teacher-a", roles: [{ app: "siakad", role: "guru", unitId: unitA }] };
const homeroomA: SiakadPrincipal = { id: "homeroom-a", roles: [{ app: "siakad", role: "wali_kelas", unitId: unitA }] };
const parentA: SiakadPrincipal = { id: "parent-a", roles: [{ app: "siakad", role: "orang_tua" }] };
const foreignApp: SiakadPrincipal = { id: "foreign", roles: [{ app: "spmb", role: "admin_unit", unitId: unitA }] };

assert(isSuperAdmin(superAdmin), "super_admin must be recognized");
assert(allowedUnitIds(adminA, ["admin_unit"]).has(unitA), "SIAKAD role must derive its claimed unit");
assert(!allowedUnitIds(foreignApp, ["admin_unit"]).has(unitA), "foreign app claims must not grant SIAKAD scope");
assertUnitAccess(superAdmin, unitB, ["admin_unit"]);
assertUnitAccess(adminA, unitA, ["admin_unit"]);
expectForbidden("foreign unit", () => assertUnitAccess(adminA, unitB, ["admin_unit"]));
expectForbidden("foreign app", () => assertUnitAccess(foreignApp, unitA, ["admin_unit"]));

assertTeacherAssignmentAccess(teacherA, { unitId: unitA, teacherUserId: "teacher-a" });
expectForbidden("wrong teacher assignment", () =>
  assertTeacherAssignmentAccess(teacherA, { unitId: unitA, teacherUserId: "teacher-b" }),
);
expectForbidden("teacher foreign unit", () =>
  assertTeacherAssignmentAccess(teacherA, { unitId: unitB, teacherUserId: "teacher-a" }),
);

assertHomeroomAccess(homeroomA, { unitId: unitA, homeroomTeacherUserId: "homeroom-a" });
expectForbidden("wrong homeroom", () =>
  assertHomeroomAccess(homeroomA, { unitId: unitA, homeroomTeacherUserId: "teacher-a" }),
);

assertParentEnrollmentAccess(parentA, { parentUserId: "parent-a" });
expectForbidden("cross-parent read", () =>
  assertParentEnrollmentAccess(parentA, { parentUserId: "parent-b" }),
);

console.log("SIAKAD scope policy contract passed");
