import { BadRequestException } from "@nestjs/common";

export const ROLE_CATALOG = {
  auth: ["super_admin"],
  simpeg: ["admin_kepegawaian", "pegawai", "admin_unit", "admin_unit_nondik"],
  siakad: ["admin_unit", "guru"],
  spmb: ["admin_unit", "tim_ppdb"],
  simakin: ["admin_bidang", "admin_biro", "pic_program", "pic_task"],
} as const;

export const UNIT_SCOPED_ROLES = new Set([
  "simpeg:admin_unit",
  "simpeg:admin_unit_nondik",
  "siakad:admin_unit",
  "spmb:admin_unit",
]);

export const DEPARTMENT_SCOPED_ROLES = new Set([
  "simakin:admin_bidang",
  "simakin:admin_biro",
]);

export type RoleAssignmentInput = {
  app: string;
  role: string;
  unitId?: string | null;
  departmentId?: string | null;
};

export type RoleScope = "generic" | "unit" | "department";

function roleKey(input: Pick<RoleAssignmentInput, "app" | "role">) {
  return `${input.app}:${input.role}`;
}

export function getRoleScope(input: RoleAssignmentInput): RoleScope {
  const key = roleKey(input);
  if (UNIT_SCOPED_ROLES.has(key)) return "unit";
  if (DEPARTMENT_SCOPED_ROLES.has(key)) return "department";
  return "generic";
}

export function validateRoleAssignment(input: RoleAssignmentInput): RoleScope {
  const roles = ROLE_CATALOG[input.app as keyof typeof ROLE_CATALOG];
  if (!roles || !(roles as readonly string[]).includes(input.role)) {
    throw new BadRequestException("Pasangan aplikasi dan peran tidak dikenal.");
  }

  const scope = getRoleScope(input);
  if (scope === "unit") {
    if (!input.unitId) throw new BadRequestException("Peran ini memerlukan unitId.");
    if (input.departmentId) throw new BadRequestException("Peran unit tidak boleh memiliki departmentId.");
    return scope;
  }

  if (scope === "department") {
    if (!input.departmentId) throw new BadRequestException("Peran ini memerlukan departmentId.");
    if (input.unitId) throw new BadRequestException("Peran department tidak boleh memiliki unitId.");
    return scope;
  }

  if (input.unitId || input.departmentId) {
    throw new BadRequestException("Peran umum tidak boleh memiliki unitId atau departmentId.");
  }
  return scope;
}

export function assertDirectRoleAssignment(input: RoleAssignmentInput) {
  const scope = validateRoleAssignment(input);
  if (scope !== "generic") {
    throw new BadRequestException("Kelola peran berscope dari menu Struktur Organisasi SIMPEG.");
  }
  return input;
}
