import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { verifyAuthToken } from "@alfida/auth-sdk";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

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
export class SiakadAuthGuard implements CanActivate {
  private readonly verificationKey: string;
  private readonly issuer: string;
  private readonly audience: string;

  constructor() {
    this.verificationKey =
      process.env.AUTH_JWKS_URL ||
      process.env.AUTH_SECRET ||
      process.env.BETTER_AUTH_SECRET ||
      process.env.JWT_SECRET ||
      "";
    this.issuer = process.env.AUTH_JWT_ISSUER || "";
    this.audience = process.env.AUTH_JWT_AUDIENCE || "siakad";
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers?: { authorization?: unknown };
      cookies?: Record<string, unknown>;
      user?: SiakadPrincipal;
    }>();

    if (request.user?.id) return true;
    if (!this.verificationKey || !this.issuer || !this.audience) {
      throw new UnauthorizedException("Konfigurasi verifikasi SSO SIAKAD belum lengkap");
    }

    const authorization = request.headers?.authorization;
    const bearerToken =
      typeof authorization === "string" && authorization.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length)
        : undefined;
    const rawToken = bearerToken || readCookieToken(request.cookies);
    if (!rawToken) {
      throw new UnauthorizedException("Autentikasi gagal: token tidak ditemukan");
    }

    const payload = await verifyAuthToken(normalizeSignedSessionToken(rawToken), this.verificationKey, {
      issuer: this.issuer,
      audience: this.audience,
    });
    if (!payload?.sub) {
      throw new UnauthorizedException("Sesi tidak valid atau telah kedaluwarsa");
    }

    request.user = {
      id: payload.sub,
      roles: Array.isArray(payload.roles) ? (payload.roles as SiakadPrincipal["roles"]) : [],
    };
    return true;
  }
}
