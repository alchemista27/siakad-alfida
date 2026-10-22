import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseUnitId(input: string | string[] | undefined): string | undefined {
  if (input === undefined) return undefined;
  if (typeof input !== "string" || !UUID.test(input)) {
    throw new BadRequestException("unitId wajib berupa UUID.");
  }
  return input;
}

export function parseUpdatedAfter(input: string | string[] | undefined): Date | undefined {
  if (input === undefined) return undefined;
  if (typeof input !== "string" || !ISO_TIMESTAMP.test(input)) {
    throw new BadRequestException("updatedAfter wajib berupa timestamp ISO 8601.");
  }
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException("updatedAfter wajib berupa timestamp ISO 8601 yang valid.");
  }
  return parsed;
}

function matchesSecret(provided: unknown, expected: string): boolean {
  if (typeof provided !== "string") return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

@Injectable()
export class InternalServiceAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.INTERNAL_SERVICE_SECRET?.trim();
    if (!expected) {
      throw new ServiceUnavailableException("Kredensial layanan internal belum dikonfigurasi.");
    }
    const request = context.switchToHttp().getRequest<{ headers?: Record<string, unknown> }>();
    const provided = request.headers?.["x-internal-service-key"];
    if (!matchesSecret(provided, expected)) {
      throw new UnauthorizedException("Kredensial layanan internal tidak valid.");
    }
    return true;
  }
}
