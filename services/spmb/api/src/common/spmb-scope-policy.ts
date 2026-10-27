import { ForbiddenException } from "@nestjs/common";

export type SpmbRoleClaim = { role: string; app?: string; unitId?: string | null } | string;

export const SPMB_TEAM_ROLE_VALUES = ["tim_spmb", "tim_ppdb"] as const;

export type SpmbPrincipal = {
  id: string;
  roles: SpmbRoleClaim[];
};

function asClaim(role: SpmbRoleClaim): Exclude<SpmbRoleClaim, string> | null {
  return typeof role === "string" ? null : role;
}

export function matchesSpmbRole(actualRole: string, requiredRoles: readonly string[]): boolean {
  return requiredRoles.some((requiredRole) =>
    actualRole === requiredRole ||
    (SPMB_TEAM_ROLE_VALUES.includes(actualRole as (typeof SPMB_TEAM_ROLE_VALUES)[number]) &&
      SPMB_TEAM_ROLE_VALUES.includes(requiredRole as (typeof SPMB_TEAM_ROLE_VALUES)[number])),
  );
}

export function isSuperAdmin(principal: SpmbPrincipal): boolean {
  return principal.roles.some((role) => {
    const claim = asClaim(role);
    return claim?.role === "super_admin" && (claim.app === "*" || claim.app === "auth" || claim.app === "core");
  });
}

export function allowedUnitIds(principal: SpmbPrincipal, roles: readonly string[]): ReadonlySet<string> {
  const unitIds = new Set<string>();
  for (const role of principal.roles) {
    const claim = asClaim(role);
    if (!claim || !matchesSpmbRole(claim.role, roles) || (claim.app !== "spmb" && claim.app !== "*")) continue;
    if (claim.unitId) unitIds.add(claim.unitId);
  }
  return unitIds;
}

export function assertUnitAccess(principal: SpmbPrincipal, unitId: string, roles: readonly string[]): void {
  if (isSuperAdmin(principal) || allowedUnitIds(principal, roles).has(unitId)) return;
  throw new ForbiddenException("Akses unit SPMB ditolak.");
}
