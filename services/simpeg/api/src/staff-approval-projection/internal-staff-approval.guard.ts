import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";

function matchesSecret(provided: unknown, expected: string): boolean {
  if (typeof provided !== "string") return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

@Injectable()
export class InternalStaffApprovalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.SIMPEG_INTERNAL_SERVICE_TOKEN?.trim();
    if (!expected) {
      throw new ServiceUnavailableException("Kredensial integrasi persetujuan staf belum dikonfigurasi.");
    }
    const request = context.switchToHttp().getRequest<{ headers?: Record<string, unknown> }>();
    if (!matchesSecret(request.headers?.["x-internal-service-token"], expected)) {
      throw new UnauthorizedException("Kredensial integrasi persetujuan staf tidak valid.");
    }
    return true;
  }
}
