import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const ADMIN_ROLES_KEY = "admin_roles";

export const AdminRoles = (...roles: string[]) => SetMetadata(ADMIN_ROLES_KEY, roles);

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ADMIN_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles || !Array.isArray(user.roles)) {
      throw new ForbiddenException("Akses ditolak: pengguna tidak memiliki wewenang administrator");
    }

    // Default required roles if none specified: super_admin
    const rolesToCheck = requiredRoles && requiredRoles.length > 0 ? requiredRoles : ["super_admin"];

    const hasAllowedRole = user.roles.some((r: any) => {
      const roleName = typeof r === "string" ? r : r.role;
      const appName = typeof r === "string" ? "*" : r.app || "*";

      // Super admin has universal bypass
      if (roleName === "super_admin" && (appName === "*" || appName === "auth" || appName === "core" || appName === "admin")) {
        return true;
      }

      if (appName === "*" || appName === "admin" || appName === "auth") {
        return rolesToCheck.includes(roleName);
      }

      return false;
    });

    if (!hasAllowedRole) {
      throw new ForbiddenException(
        `Akses ditolak: membutuhkan hak akses [${rolesToCheck.join(", ")}] untuk panel Admin Yayasan`
      );
    }

    return true;
  }
}
