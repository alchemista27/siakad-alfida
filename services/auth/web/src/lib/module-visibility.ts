import type { UserRoleScope } from "@alfida/contracts";

export function isParentOnlyPortalUser(roles: readonly UserRoleScope[]): boolean {
  return roles.length > 0 && roles.every((scope) => scope.role === "orang_tua");
}
