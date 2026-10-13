import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { hasRole, AppName } from "@alfida/contracts";
import { REQUIRE_ROLE_KEY, RequireRoleOptions } from "./decorators";

@Injectable()
export class ServiceRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roleConfig = this.reflector.getAllAndOverride<
      (RequireRoleOptions & { role: string }) | undefined
    >(REQUIRE_ROLE_KEY, [context.getHandler(), context.getClass()]);

    if (!roleConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      throw new ForbiddenException("Akses ditolak: pengguna tidak memiliki peran");
    }

    const app: AppName = (roleConfig.app && roleConfig.app !== "*" ? roleConfig.app : "core") as AppName;
    const unitId = roleConfig.unitParam ? request.params[roleConfig.unitParam] || request.query[roleConfig.unitParam] : undefined;
    const departmentId = roleConfig.deptParam ? request.params[roleConfig.deptParam] || request.query[roleConfig.deptParam] : undefined;

    const allowed = hasRole(user.roles, app, roleConfig.role, {
      unitId,
      departmentId,
    });

    if (!allowed) {
      throw new ForbiddenException(
        `Akses ditolak: membutuhkan peran ${roleConfig.role} pada modul ${app}`
      );
    }

    return true;
  }
}
