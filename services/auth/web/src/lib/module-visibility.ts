import type { UserRoleScope } from "@alfida/contracts";

export type CoreServiceModule = "simakin" | "simpeg" | "siyaum" | "siakad" | "siskeu";

export function canSeeCoreServiceModule(
  roles: readonly UserRoleScope[],
  app: CoreServiceModule,
): boolean {
  return roles.some(
    (scope) =>
      (scope.role === "super_admin"
        && (scope.app === "*" || scope.app === "auth" || scope.app === "core"))
      || scope.app === app,
  );
}
