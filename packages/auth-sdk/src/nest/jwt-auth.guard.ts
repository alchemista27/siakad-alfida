import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { verifyAuthToken } from "../jwt";
import { ALFIDA_SESSION_COOKIE } from "../types";

@Injectable()
export class ServiceJwtAuthGuard implements CanActivate {
  private secretOrJwksUrl: string;

  constructor() {
    this.secretOrJwksUrl =
      process.env.AUTH_SECRET ||
      process.env.BETTER_AUTH_SECRET ||
      process.env.JWKS_URL ||
      "alfida-sso-secret-key-32-chars-long!!";
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token = "";

    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      // Coba ekstrak dari Cookie alfida_session
      const cookieHeader = request.headers.cookie || "";
      const match = cookieHeader.match(
        new RegExp(`(?:^|;\\s*)(?:${ALFIDA_SESSION_COOKIE}|better-auth\\.session_token)=([^;]+)`)
      );
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      throw new UnauthorizedException("Autentikasi gagal: token tidak ditemukan");
    }

    // Jika format token signed: <token>.<signature>
    const dotSignatureIndex = token.lastIndexOf(".");
    if (dotSignatureIndex > 0 && token.split(".").length > 3) {
      token = token.substring(0, dotSignatureIndex);
    }

    const payload = await verifyAuthToken(token, this.secretOrJwksUrl);
    if (!payload) {
      throw new UnauthorizedException("Sesi tidak valid atau telah kedaluwarsa");
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      fullName: payload.name,
      roles: payload.roles,
    };

    return true;
  }
}
