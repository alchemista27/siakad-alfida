import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const SIMAKIN_ROLES_KEY = 'simakin_roles';

/**
 * Decorator untuk menentukan daftar peran yang diizinkan mengakses handler / controller.
 * Mendukung multiple roles, misal: @SimakinRoles('admin_bidang', 'admin_biro')
 */
export const SimakinRoles = (...roles: string[]) => SetMetadata(SIMAKIN_ROLES_KEY, roles);

@Injectable()
export class SimakinRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(SIMAKIN_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika endpoint tidak memiliki anotasi @SimakinRoles, izinkan semua user terautentikasi
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles || !Array.isArray(user.roles)) {
      throw new ForbiddenException('Akses ditolak: pengguna tidak memiliki peran aktif');
    }

    // Periksa apakah pengguna memiliki salah satu dari peran yang diizinkan
    const hasAllowedRole = user.roles.some((r: any) => {
      const roleName = typeof r === 'string' ? r : r.role;
      const appName = typeof r === 'string' ? '*' : r.app || '*';

      // 1. Super Admin memiliki hak akses penuh (wildcard)
      if (roleName === 'super_admin' && (appName === '*' || appName === 'auth' || appName === 'core')) {
        return true;
      }

      // 2. Periksa peran khusus aplikasi SIMAKIN
      if (appName === '*' || appName === 'simakin') {
        return requiredRoles.includes(roleName);
      }

      return false;
    });

    if (!hasAllowedRole) {
      throw new ForbiddenException(
        `Akses ditolak: membutuhkan wewenang peran [${requiredRoles.join(', ')}] pada sistem SIMAKIN`
      );
    }

    return true;
  }
}
