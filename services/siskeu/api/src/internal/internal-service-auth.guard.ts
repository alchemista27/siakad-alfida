import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class InternalServiceAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const token = process.env.SISKEU_INTERNAL_SERVICE_TOKEN;
    if (!token) throw new ServiceUnavailableException("Kredensial internal SISKEU belum dikonfigurasi.");
    const provided = context.switchToHttp().getRequest<{ headers?: Record<string, unknown> }>().headers?.["x-internal-service-key"];
    if (typeof provided !== "string" || provided !== token) {
      throw new UnauthorizedException("Kredensial layanan internal tidak valid.");
    }
    return true;
  }
}
