import { ForbiddenException } from "@nestjs/common";

/**
 * Local literals are intentionally temporary until @alfida/contracts owns the
 * canonical SIAKAD catalog. Keep this module dependency-free for no-DB tests.
 */
export type SiakadRoleClaim = { role: string; app?: string; unitId?: string | null; [key: string]: unknown } | string;

export type SiakadPrincipal = {
  id: string;
  roles: SiakadRoleClaim[];
};

export type UnitScopedResource = { unitId?: string | null };
export type TeacherAssignmentResource = UnitScopedResource & { teacherUserId: string };
export type HomeroomAssignmentResource = UnitScopedResource & { homeroomTeacherUserId: string };
export type ParentEnrollmentResource = { parentUserId?: string | null };

function asClaim(role: SiakadRoleClaim): Exclude<SiakadRoleClaim, string> | null {
  return typeof role === "string" ? null : role;
}

export function isSuperAdmin(principal: SiakadPrincipal): boolean {
  return principal.roles.some((role) => {
    const claim = asClaim(role);
    return claim?.role === "super_admin" && (claim.app === "*" || claim.app === "auth" || claim.app === "core");
  });
}

function hasRole(principal: SiakadPrincipal, roleName: string): boolean {
  return principal.roles.some((role) => {
    if (typeof role === "string") return role === roleName;
    const app = role.app ?? "*";
    return role.role === roleName && (app === "siakad" || app === "*");
  });
}

export function allowedUnitIds(
  principal: SiakadPrincipal,
  roles: readonly string[] = ["admin_unit"],
): ReadonlySet<string> {
  const unitIds = new Set<string>();
  for (const role of principal.roles) {
    const claim = asClaim(role);
    if (!claim || !roles.includes(claim.role) || (claim.app !== "siakad" && claim.app !== "*")) continue;
    if (claim.unitId) unitIds.add(claim.unitId);
  }
  return unitIds;
}

export function assertUnitAccess(
  principal: SiakadPrincipal,
  unitId: string,
  roles: readonly string[] = ["admin_unit"],
): void {
  if (isSuperAdmin(principal) || allowedUnitIds(principal, roles).has(unitId)) return;
  throw new ForbiddenException("Akses unit SIAKAD ditolak.");
}

export function assertTeacherAssignmentAccess(
  principal: SiakadPrincipal,
  assignment: TeacherAssignmentResource,
): void {
  if (isSuperAdmin(principal)) return;
  if (!hasRole(principal, "guru")) {
    throw new ForbiddenException("Pengguna tidak memiliki wewenang peran guru SIAKAD.");
  }
  const unitIds = allowedUnitIds(principal, ["guru"]);
  if (unitIds.size > 0 && assignment.unitId) {
    if (!unitIds.has(assignment.unitId)) {
      throw new ForbiddenException("Akses unit SIAKAD ditolak.");
    }
  }
  if (assignment.teacherUserId !== principal.id) {
    throw new ForbiddenException("Penugasan guru bukan milik pengguna ini.");
  }
}

export function assertHomeroomAccess(
  principal: SiakadPrincipal,
  assignment: HomeroomAssignmentResource,
): void {
  if (isSuperAdmin(principal)) return;
  if (!hasRole(principal, "wali_kelas")) {
    throw new ForbiddenException("Pengguna tidak memiliki wewenang peran wali kelas SIAKAD.");
  }
  const unitIds = allowedUnitIds(principal, ["wali_kelas"]);
  if (unitIds.size > 0 && assignment.unitId) {
    if (!unitIds.has(assignment.unitId)) {
      throw new ForbiddenException("Akses unit SIAKAD ditolak.");
    }
  }
  if (assignment.homeroomTeacherUserId !== principal.id) {
    throw new ForbiddenException("Penugasan wali kelas bukan milik pengguna ini.");
  }
}

export function assertParentEnrollmentAccess(
  principal: SiakadPrincipal,
  enrollment: ParentEnrollmentResource,
): void {
  if (isSuperAdmin(principal)) return;
  if (!hasRole(principal, "orang_tua")) {
    throw new ForbiddenException("Pengguna tidak memiliki wewenang peran orang tua SIAKAD.");
  }
  if (enrollment.parentUserId === principal.id) return;
  throw new ForbiddenException("Data akademik bukan milik orang tua ini.");
}
