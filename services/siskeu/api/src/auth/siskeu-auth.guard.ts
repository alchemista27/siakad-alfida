import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { verifyAuthToken } from "@alfida/auth-sdk";
import type { SiskeuPrincipal } from "./siskeu-roles.guard";

const SESSION_COOKIE_NAMES = [
  "alfida_session",
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const;

function readCookieToken(cookies: Record<string, unknown> | undefined): string | undefined {
  for (const name of SESSION_COOKIE_NAMES) {
    const value = cookies?.[name];
    if (typeof value === "string" && value.length > 0) return decodeURIComponent(value);
  }
  return undefined;
}

function normalizeSignedSessionToken(token: string): string {
  const parts = token.split(".");
  return parts.length > 3 ? parts.slice(0, 3).join(".") : token;
}

@Injectable()
export class SiskeuAuthGuard implements CanActivate {
  private readonly verificationKey = process.env.AUTH_JWKS_URL || process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "";
  private readonly issuer = process.env.AUTH_JWT_ISSUER || "";
  private readonly audience = process.env.AUTH_JWT_AUDIENCE || undefined;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers?: { authorization?: unknown };
      cookies?: Record<string, unknown>;
      user?: SiskeuPrincipal;
    }>();
    if (request.user?.id) return true;
    if (!this.verificationKey || !this.issuer) {
      throw new UnauthorizedException("Konfigurasi verifikasi SSO SISKEU belum lengkap.");
    }
    const authorization = request.headers?.authorization;
    const bearer = typeof authorization === "string" && authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : undefined;
    const rawToken = bearer || readCookieToken(request.cookies);
    if (!rawToken) throw new UnauthorizedException("Autentikasi gagal: token tidak ditemukan.");
    const payload = await verifyAuthToken(normalizeSignedSessionToken(rawToken), this.verificationKey, {
      issuer: this.issuer,
      audience: this.audience,
    });
    if (!payload?.sub) throw new UnauthorizedException("Sesi tidak valid atau telah kedaluwarsa.");
    request.user = { id: payload.sub, roles: Array.isArray(payload.roles) ? payload.roles : [] };
    return true;
  }
}
