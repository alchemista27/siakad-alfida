import { ScopedRole } from "./organization-access.policy";

export const HR_ADMIN_ROLES = [
  "super_admin",
  "admin_kepegawaian",
  "admin_bidang",
  "admin_unit",
  "admin_unit_nondik",
] as const;

export type HrRole = (typeof HR_ADMIN_ROLES)[number];

export function canManageHr(roles: Array<ScopedRole | string>): boolean {
  return roles.some((entry) => {
    const role = typeof entry === "string" ? entry : entry.role;
    const app = typeof entry === "string" ? "*" : entry.app || "*";
    if (role === "super_admin" && ["*", "auth", "core", "simpeg"].includes(app)) return true;
    return (app === "*" || app === "simpeg") && HR_ADMIN_ROLES.includes(role as HrRole);
  });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidDepartmentAdminAssignment(input: { departmentId: string; userId: string; role: string }) {
  return UUID.test(input.departmentId) && UUID.test(input.userId) && input.role === "admin_bidang";
}
