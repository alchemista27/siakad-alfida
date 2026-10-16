import { canManageHr, HR_ADMIN_ROLES, isValidDepartmentAdminAssignment } from "../src/common/hr-access";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

assert(HR_ADMIN_ROLES.includes("super_admin"), "super admin must administer HR");
assert(canManageHr([{ app: "*", role: "super_admin" }]), "super admin must be authorized");
assert(canManageHr([{ app: "simpeg", role: "admin_bidang" }]), "admin bidang must be authorized");
assert(canManageHr([{ app: "simpeg", role: "admin_unit" }]), "admin unit must be authorized");
assert(!canManageHr([{ app: "simpeg", role: "guru" }]), "teacher must not administer HR");
assert(!canManageHr([{ app: "other", role: "admin_bidang" }]), "foreign-app role must not administer HR");
assert(isValidDepartmentAdminAssignment({ departmentId: "00000000-0000-4000-8000-000000000001", userId: "00000000-0000-4000-8000-000000000002", role: "admin_bidang" }), "valid bidang assignment must be accepted");
assert(!isValidDepartmentAdminAssignment({ departmentId: "not-a-uuid", userId: "00000000-0000-4000-8000-000000000002", role: "admin_bidang" }), "invalid department must be rejected");
assert(!isValidDepartmentAdminAssignment({ departmentId: "00000000-0000-4000-8000-000000000001", userId: "00000000-0000-4000-8000-000000000002", role: "admin_biro" }), "only admin bidang may be assigned by SIMPEG");

console.log("SIMPEG HR access contract passed");
