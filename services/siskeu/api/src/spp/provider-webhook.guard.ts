import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class ProviderWebhookGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const token = process.env.SISKEU_PROVIDER_WEBHOOK_TOKEN;
    if (!token) throw new ServiceUnavailableException("Token webhook provider SISKEU belum dikonfigurasi.");
    const provided = context.switchToHttp().getRequest<{ headers?: Record<string, unknown> }>().headers?.["x-provider-webhook-token"];
    if (typeof provided !== "string" || provided !== token) throw new UnauthorizedException("Token webhook provider tidak valid.");
    return true;
  }
}
