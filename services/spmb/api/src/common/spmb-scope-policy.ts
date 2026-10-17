import { ForbiddenException } from "@nestjs/common";

export type SpmbRoleClaim = { role: string; app?: string; unitId?: string | null } | string;

export type SpmbPrincipal = {
  id: string;
  roles: SpmbRoleClaim[];
};

function asClaim(role: SpmbRoleClaim): Exclude<SpmbRoleClaim, string> | null {
  return typeof role === "string" ? null : role;
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
    if (!claim || !roles.includes(claim.role) || (claim.app !== "spmb" && claim.app !== "*")) continue;
    if (claim.unitId) unitIds.add(claim.unitId);
  }
  return unitIds;
}

export function assertUnitAccess(principal: SpmbPrincipal, unitId: string, roles: readonly string[]): void {
  if (isSuperAdmin(principal) || allowedUnitIds(principal, roles).has(unitId)) return;
  throw new ForbiddenException("Akses unit SPMB ditolak.");
}
