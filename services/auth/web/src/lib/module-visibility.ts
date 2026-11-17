import { isFoundationLeader, type UserRoleScope } from "@alfida/contracts";

export type CoreServiceModule = "simakin" | "simpeg" | "siyaum" | "siakad" | "siskeu";

export function canSeeCoreServiceModule(
  roles: readonly UserRoleScope[],
  app: CoreServiceModule,
): boolean {
  if (isFoundationLeader(roles)) return true;
  return roles.some(
    (scope) =>
      (scope.role === "super_admin"
        && (scope.app === "*" || scope.app === "auth" || scope.app === "core"))
      || scope.app === app,
  );
}
