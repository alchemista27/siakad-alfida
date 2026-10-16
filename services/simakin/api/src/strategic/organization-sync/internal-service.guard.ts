import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";

@Injectable()
export class InternalServiceGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const expected = process.env.AUTH_INTERNAL_SERVICE_TOKEN;
    const value = context.switchToHttp().getRequest<{ header(name: string): string | undefined }>().header("x-internal-service-token");
    if (!expected || !value) throw new UnauthorizedException("Kredensial sinkronisasi internal diperlukan.");
    const expectedBuffer = Buffer.from(expected);
    const valueBuffer = Buffer.from(value);
    if (expectedBuffer.length !== valueBuffer.length || !timingSafeEqual(expectedBuffer, valueBuffer)) throw new UnauthorizedException("Kredensial sinkronisasi internal tidak valid.");
    return true;
  }
}
