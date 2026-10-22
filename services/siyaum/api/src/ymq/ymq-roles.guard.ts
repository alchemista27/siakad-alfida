import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { hasAnyYmqRole, type YmqPrincipal } from "./ymq-access.policy";
import { YMQ_ROLES_KEY } from "./ymq-roles.decorator";

@Injectable()
export class YmqRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(YMQ_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const principal = context.switchToHttp().getRequest<{ user?: YmqPrincipal }>().user;
    if (!hasAnyYmqRole(principal, requiredRoles)) {
      throw new ForbiddenException("Akses ditolak untuk peran SIYAUM ini.");
    }
    return true;
  }
}
