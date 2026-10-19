import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const SISKEU_FINANCE_ROLES_KEY = "siskeu_finance_roles";
export const SiskeuFinanceRoles = () => SetMetadata(SISKEU_FINANCE_ROLES_KEY, ["admin_keuangan", "super_admin"]);

type RoleClaim = { role?: unknown; app?: unknown };
export type SiskeuPrincipal = { id?: string; roles?: unknown[] };

export function assertSiskeuFinanceRole(principal: SiskeuPrincipal): void {
  const allowed = Array.isArray(principal.roles) && principal.roles.some((claim) => {
    if (!claim || typeof claim !== "object") return false;
    const role = claim as RoleClaim;
    const roleName = typeof role.role === "string" ? role.role : "";
    const appName = typeof role.app === "string" ? role.app : "";
    return (appName === "siskeu" || appName === "*") && (roleName === "admin_keuangan" || roleName === "super_admin");
  });
  if (!allowed) throw new ForbiddenException("Akses SISKEU memerlukan peran admin_keuangan atau super_admin pada scope siskeu.");
}

@Injectable()
export class SiskeuRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[] | undefined>(SISKEU_FINANCE_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;
    const user = context.switchToHttp().getRequest<{ user?: SiskeuPrincipal }>().user;
    assertSiskeuFinanceRole(user || {});
    return true;
  }
}
