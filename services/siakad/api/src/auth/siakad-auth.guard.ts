import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Injectable()
export class SiakadAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.user) {
      return true;
    }

    const authHeader = request.headers?.authorization;
    let token: string | undefined;

    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (request.cookies?.alfida_session) {
      token = request.cookies.alfida_session;
    } else if (request.cookies?.["better-auth.session_token"]) {
      token = request.cookies["better-auth.session_token"];
    }

    if (!token) {
      throw new UnauthorizedException("Autentikasi gagal: token tidak ditemukan");
    }

    // Strip signature suffix if token is signed with extra dot (e.g. cookie signed format)
    const dotSignatureIndex = token.lastIndexOf(".");
    if (dotSignatureIndex > 0 && token.split(".").length > 3) {
      token = token.substring(0, dotSignatureIndex);
    }

    try {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const payloadJson = Buffer.from(parts[1], "base64url").toString("utf8");
        const payload = JSON.parse(payloadJson);
        request.user = {
          id: payload.sub ?? payload.id,
          roles: payload.roles ?? [],
        } as SiakadPrincipal;
        return true;
      }
    } catch {
      throw new UnauthorizedException("Sesi tidak valid atau telah kedaluwarsa");
    }

    throw new UnauthorizedException("Sesi tidak valid atau telah kedaluwarsa");
  }
}
