import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";

@Injectable()
export class InternalYmqRoleBrokerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.INTERNAL_SERVICE_SECRET;
    if (!expected) {
      throw new ServiceUnavailableException("Kredensial layanan internal belum dikonfigurasi.");
    }

    const request = context.switchToHttp().getRequest<{ header(name: string): string | undefined }>();
    const received = request.header("x-internal-service-key");
    if (!received) {
      throw new UnauthorizedException("Kredensial layanan internal diperlukan.");
    }

    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);
    if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) {
      throw new UnauthorizedException("Kredensial layanan internal tidak valid.");
    }
    return true;
  }
}
