import { z } from "zod";
import { ROLE_CATALOG } from "./role-catalog";

export const APP_NAMES = Object.keys(ROLE_CATALOG) as Array<keyof typeof ROLE_CATALOG>;

export type AppName = (typeof APP_NAMES)[number];

export const APP_ROLES = ROLE_CATALOG;

export type AppRoleMap = typeof APP_ROLES;

export interface UserRoleScope {
  role: string;
  app: AppName | "*";
  unitId?: string | null;
  departmentId?: string | null;
}

export const UserRoleScopeSchema = z.object({
  role: z.string(),
  app: z.string(),
  unitId: z.string().uuid().nullable().optional(),
  departmentId: z.string().uuid().nullable().optional(),
});

export function hasRole(
  userRoles: UserRoleScope[],
  app: AppName,
  role: string,
  options?: { unitId?: string | null; departmentId?: string | null }
): boolean {
  return userRoles.some((r) => {
    // Global super_admin has access to all apps
    if (r.role === "super_admin" && (r.app === "*" || r.app === "auth")) {
      return true;
    }

    if (r.app !== "*" && r.app !== app) {
      return false;
    }

    if (r.role !== role) {
      return false;
    }

    if (options?.unitId && r.unitId && r.unitId !== options.unitId) {
      return false;
    }

    if (options?.departmentId && r.departmentId && r.departmentId !== options.departmentId) {
      return false;
    }

    return true;
  });
}
