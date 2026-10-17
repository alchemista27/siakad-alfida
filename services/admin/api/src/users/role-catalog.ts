import { BadRequestException } from "@nestjs/common";
import {
  DEPARTMENT_SCOPED_ROLE_KEYS,
  ROLE_CATALOG,
  UNIT_SCOPED_ROLE_KEYS,
  type RoleCatalogApp,
} from "@alfida/contracts";

export { DEPARTMENT_SCOPED_ROLE_KEYS, ROLE_CATALOG, UNIT_SCOPED_ROLE_KEYS };
export const UNIT_SCOPED_ROLES = UNIT_SCOPED_ROLE_KEYS;
export const DEPARTMENT_SCOPED_ROLES = DEPARTMENT_SCOPED_ROLE_KEYS;

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
  if (UNIT_SCOPED_ROLE_KEYS.has(key)) return "unit";
  if (DEPARTMENT_SCOPED_ROLE_KEYS.has(key)) return "department";
  return "generic";
}

export function validateRoleAssignment(input: RoleAssignmentInput): RoleScope {
  const roles = ROLE_CATALOG[input.app as RoleCatalogApp];
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
