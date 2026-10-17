import {
  DEPARTMENT_SCOPED_ROLE_KEYS,
  ROLE_CATALOG,
  UNIT_SCOPED_ROLE_KEYS,
  type RoleCatalogApp,
} from "@alfida/contracts";

export type RoleScope = "generic" | "unit" | "department";

export const ROLE_CATALOG_APPS = Object.keys(ROLE_CATALOG) as RoleCatalogApp[];

export const MANUAL_ASSIGNABLE_ROLE_CATALOG = Object.fromEntries(
  Object.entries(ROLE_CATALOG).map(([app, roles]) => [
    app,
    roles.filter((role) => {
      const key = `${app}:${role}`;
      return !UNIT_SCOPED_ROLE_KEYS.has(key) && !DEPARTMENT_SCOPED_ROLE_KEYS.has(key);
    }),
  ]),
) as unknown as Record<string, readonly string[]>;

export function rolesForApp(app: string): readonly string[] {
  return ROLE_CATALOG[app as RoleCatalogApp] ?? [];
}

export function firstCatalogRole(app: string): string {
  return rolesForApp(app)[0] ?? "";
}

export function firstManualRole(app: string): string {
  return MANUAL_ASSIGNABLE_ROLE_CATALOG[app as RoleCatalogApp]?.[0] ?? "";
}

export function getRoleScope(app: string, role: string): RoleScope {
  const key = `${app}:${role}`;
  if (UNIT_SCOPED_ROLE_KEYS.has(key)) return "unit";
  if (DEPARTMENT_SCOPED_ROLE_KEYS.has(key)) return "department";
  return "generic";
}
