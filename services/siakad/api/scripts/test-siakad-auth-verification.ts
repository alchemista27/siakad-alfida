import assert from "node:assert/strict";
import { UnauthorizedException } from "@nestjs/common";
import { createAuthToken } from "@alfida/auth-sdk";
import { SiakadAuthGuard } from "../src/auth/siakad-auth.guard";

function makeContext(headers: Record<string, string> = {}, cookies: Record<string, string> = {}) {
  const request: { headers: Record<string, string>; cookies: Record<string, string>; user?: unknown } = {
    headers,
    cookies,
  };

  return {
    request,
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
    },
  };
}

async function expectUnauthorized(label: string, action: () => boolean | Promise<boolean>) {
  await assert.rejects(async () => action(), (error: unknown) => {
    assert(error instanceof UnauthorizedException, `${label}: expected UnauthorizedException`);
    return true;
  });
}

async function main() {
  process.env.AUTH_SECRET = "siakad-auth-verification-test-secret";
  process.env.AUTH_JWT_ISSUER = "https://auth.alfida.or.id";
  process.env.AUTH_JWT_AUDIENCE = "siakad";

  const guard = new SiakadAuthGuard();
  const validToken = await createAuthToken(
    {
      sub: "teacher-1",
      email: "teacher@alfida.or.id",
      name: "Guru Alfida",
      roles: [{ app: "siakad", role: "guru" }],
    },
    process.env.AUTH_SECRET,
    { issuer: process.env.AUTH_JWT_ISSUER, audience: process.env.AUTH_JWT_AUDIENCE, expiresIn: "1h" },
  );

  const valid = makeContext({ authorization: `Bearer ${validToken}` });
  assert.equal(await guard.canActivate(valid.context as never), true, "valid signed token must be accepted");
  assert.deepEqual(valid.request.user, {
    id: "teacher-1",
    roles: [{ app: "siakad", role: "guru" }],
  });

  const forgedPayload = Buffer.from(
    JSON.stringify({
      sub: "attacker",
      roles: [{ app: "*", role: "super_admin" }],
      iss: process.env.AUTH_JWT_ISSUER,
      aud: process.env.AUTH_JWT_AUDIENCE,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString("base64url");
  const forged = `eyJhbGciOiJIUzI1NiJ9.${forgedPayload}.forged-signature`;
  await expectUnauthorized("forged signed-looking JWT", () =>
    guard.canActivate(makeContext({ authorization: `Bearer ${forged}` }).context as never),
  );

  const wrongIssuer = await createAuthToken(
    { sub: "teacher-1", email: "teacher@alfida.or.id", name: "Guru Alfida", roles: [] },
    process.env.AUTH_SECRET,
    { issuer: "https://attacker.invalid", audience: process.env.AUTH_JWT_AUDIENCE, expiresIn: "1h" },
  );
  await expectUnauthorized("wrong issuer", () =>
    guard.canActivate(makeContext({ authorization: `Bearer ${wrongIssuer}` }).context as never),
  );

  const expired = await createAuthToken(
    { sub: "teacher-1", email: "teacher@alfida.or.id", name: "Guru Alfida", roles: [] },
    process.env.AUTH_SECRET,
    { issuer: process.env.AUTH_JWT_ISSUER, audience: process.env.AUTH_JWT_AUDIENCE, expiresIn: "0s" },
  );
  await expectUnauthorized("expired token", () =>
    guard.canActivate(makeContext({ authorization: `Bearer ${expired}` }).context as never),
  );

  console.log("SIAKAD auth verification contract passed");
}

void main();
