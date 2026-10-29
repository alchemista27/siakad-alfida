import { SignJWT, jwtVerify, createRemoteJWKSet, JWTVerifyGetKey } from "jose";
import { AuthTokenPayload } from "./types";

let cachedJwks: JWTVerifyGetKey | null = null;
let cachedJwksUrl: string | null = null;

function getJwks(jwksUrl: string): JWTVerifyGetKey {
  if (cachedJwks && cachedJwksUrl === jwksUrl) {
    return cachedJwks;
  }
  cachedJwks = createRemoteJWKSet(new URL(jwksUrl));
  cachedJwksUrl = jwksUrl;
  return cachedJwks;
}

function readAvatarUrl(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export async function createAuthToken(
  payload: AuthTokenPayload,
  secretKey: string,
  options?: { expiresIn?: string; issuer?: string; audience?: string }
): Promise<string> {
  const secret = new TextEncoder().encode(secretKey);
  const jwt = new SignJWT({
    email: payload.email,
    name: payload.name,
    avatarUrl: payload.avatarUrl ?? null,
    roles: payload.roles,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(options?.expiresIn || "7d");

  if (options?.issuer) {
    jwt.setIssuer(options.issuer);
  }
  if (options?.audience) {
    jwt.setAudience(options.audience);
  }

  return await jwt.sign(secret);
}

export async function verifyAuthToken(
  token: string,
  secretOrJwksUrl: string,
  options?: { issuer?: string; audience?: string }
): Promise<AuthTokenPayload | null> {
  try {
    if (secretOrJwksUrl.startsWith("http://") || secretOrJwksUrl.startsWith("https://")) {
      const JWKS = getJwks(secretOrJwksUrl);
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: options?.issuer,
        audience: options?.audience,
      });

      return {
        sub: payload.sub as string,
        email: (payload.email as string) || "",
        name: (payload.name as string) || "",
        avatarUrl: readAvatarUrl(payload.avatarUrl),
        roles: (payload.roles as any) || [],
        iss: payload.iss,
        aud: payload.aud as string,
        exp: payload.exp,
        iat: payload.iat,
      };
    } else {
      const secret = new TextEncoder().encode(secretOrJwksUrl);
      const { payload } = await jwtVerify(token, secret, {
        issuer: options?.issuer,
        audience: options?.audience,
      });

      return {
        sub: payload.sub as string,
        email: (payload.email as string) || "",
        name: (payload.name as string) || "",
        avatarUrl: readAvatarUrl(payload.avatarUrl),
        roles: (payload.roles as any) || [],
        iss: payload.iss,
        aud: payload.aud as string,
        exp: payload.exp,
        iat: payload.iat,
      };
    }
  } catch (err) {
    return null;
  }
}
