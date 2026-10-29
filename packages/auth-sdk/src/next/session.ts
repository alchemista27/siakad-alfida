import { verifyAuthToken } from "../jwt";
import { ALFIDA_SESSION_COOKIE, AuthUser } from "../types";

export interface CookieReader {
  get(name: string): { value: string } | undefined;
}

export async function getNextServerSession(
  cookies: CookieReader,
  secretOrJwksUrl?: string
): Promise<AuthUser | null> {
  const secret =
    secretOrJwksUrl ||
    process.env.AUTH_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    process.env.JWT_SECRET ||
    "alfida-sso-secret-key-32-chars-long!!";

  const sessionCookie =
    cookies.get(ALFIDA_SESSION_COOKIE)?.value ||
    cookies.get("better-auth.session_token")?.value;

  if (!sessionCookie) {
    return null;
  }

  let token = decodeURIComponent(sessionCookie);
  const dotSignatureIndex = token.lastIndexOf(".");
  if (dotSignatureIndex > 0 && token.split(".").length > 3) {
    token = token.substring(0, dotSignatureIndex);
  }

  const payload = await verifyAuthToken(token, secret);
  if (!payload) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    fullName: payload.name,
    avatarUrl: payload.avatarUrl ?? null,
    roles: payload.roles || [],
    isActive: true,
  };
}
