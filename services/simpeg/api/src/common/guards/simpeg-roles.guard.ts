import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const SIMPEG_ROLES_KEY = "simpeg_roles";
export const SimpegRoles = (...roles: string[]) => SetMetadata(SIMPEG_ROLES_KEY, roles);

@Injectable()
export class SimpegRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<string[]>(SIMPEG_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!allowedRoles?.length) return true;

    const user = context.switchToHttp().getRequest().user;
    const permitted = (user?.roles || []).some((entry: unknown) => {
      if (!entry || typeof entry !== "object") return false;
      const { app, role } = entry as { app?: string; role?: string };
      if (!app || !role) return false;
      if (role === "super_admin" && ["*", "auth", "core", "simpeg"].includes(app)) return true;
      return (app === "*" || app === "simpeg") && allowedRoles.includes(role);
    });

    if (!permitted) {
      throw new ForbiddenException(`Akses ditolak: membutuhkan peran SIMPEG [${allowedRoles.join(", ")}]`);
    }
    return true;
  }
}
