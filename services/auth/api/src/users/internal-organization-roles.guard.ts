import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";

@Injectable()
export class InternalOrganizationRolesGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const expected = process.env.AUTH_INTERNAL_SERVICE_TOKEN?.trim() || process.env.INTERNAL_SERVICE_SECRET?.trim();
    const request = context.switchToHttp().getRequest<{ header(name: string): string | undefined }>();
    const received = request.header("x-internal-service-token");
    if (!expected || !received) throw new UnauthorizedException("Kredensial layanan internal diperlukan.");
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);
    if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) throw new UnauthorizedException("Kredensial layanan internal tidak valid.");
    return true;
  }
}
