import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { matchesSpmbRole } from "../spmb-scope-policy";

export const SPMB_ROLES_KEY = "spmb_roles";

/**
 * Decorator untuk menentukan daftar peran yang diizinkan mengakses handler / controller pada sistem SPMB.
 * Mendukung multiple roles, contoh: @SpmbRoles('admin_unit', 'tim_spmb')
 */
export const SpmbRoles = (...roles: string[]) => SetMetadata(SPMB_ROLES_KEY, roles);

@Injectable()
export class SpmbRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(SPMB_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika handler tidak memiliki anotasi @SpmbRoles, izinkan semua user terautentikasi
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles || !Array.isArray(user.roles)) {
      throw new ForbiddenException("Akses ditolak: pengguna tidak memiliki wewenang pada sistem SPMB");
    }

    const hasAllowedRole = user.roles.some((r: any) => {
      const roleName = typeof r === "string" ? r : r.role;
      const appName = typeof r === "string" ? "*" : r.app || "*";

      // 1. Super Admin memiliki hak akses penuh (wildcard)
      if (roleName === "super_admin" && (appName === "*" || appName === "auth" || appName === "core")) {
        return true;
      }

      // 2. Periksa peran khusus aplikasi SPMB
      if (appName === "*" || appName === "spmb") {
        return matchesSpmbRole(roleName, requiredRoles);
      }

      return false;
    });

    if (!hasAllowedRole) {
      throw new ForbiddenException(
        `Akses ditolak: membutuhkan wewenang peran [${requiredRoles.join(", ")}] pada sistem SPMB`
      );
    }

    return true;
  }
}
