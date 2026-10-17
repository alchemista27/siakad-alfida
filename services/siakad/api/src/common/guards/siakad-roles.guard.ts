import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const SIAKAD_ROLES_KEY = "siakad_roles";

// Local role names are temporary until @alfida/contracts provides the catalog.
export const SiakadRoles = (...roles: string[]) => SetMetadata(SIAKAD_ROLES_KEY, roles);

type RoleClaim = { role?: unknown; app?: unknown } | string;

function hasSiakadRole(role: RoleClaim, requiredRoles: readonly string[]): boolean {
  const roleName = typeof role === "string" ? role : typeof role.role === "string" ? role.role : undefined;
  const appName = typeof role === "string" ? "*" : typeof role.app === "string" ? role.app : "*";

  if (!roleName) return false;
  if (roleName === "super_admin" && (appName === "*" || appName === "auth" || appName === "core")) {
    return true;
  }

  return (appName === "*" || appName === "siakad") && requiredRoles.includes(roleName);
}

@Injectable()
export class SiakadRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(SIAKAD_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) return true;

    const user = context.switchToHttp().getRequest<{ user?: { roles?: unknown } }>().user;
    if (!user || !Array.isArray(user.roles) || !user.roles.some((role) => hasSiakadRole(role as RoleClaim, requiredRoles))) {
      throw new ForbiddenException(
        `Akses ditolak: membutuhkan wewenang peran [${requiredRoles.join(", ")}] pada sistem SIAKAD`,
      );
    }

    return true;
  }
}
