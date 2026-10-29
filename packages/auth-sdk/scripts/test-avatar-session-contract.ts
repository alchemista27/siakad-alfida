import assert from "node:assert/strict";
import { createAuthToken, verifyAuthToken } from "../src/jwt";
import { getNextServerSession } from "../src/next/session";
import { ServiceJwtAuthGuard } from "../src/nest/jwt-auth.guard";
import { ALFIDA_SESSION_COOKIE } from "../src/types";

const secret = "avatar-session-test-secret";
const avatarUrl = "https://res.cloudinary.com/example/image/upload/auth/user/user-1/avatar/profile.webp";

async function main() {
  const token = await createAuthToken({
    sub: "user-1",
    email: "avatar@example.test",
    name: "Avatar User",
    avatarUrl,
    roles: [],
  }, secret);

  const payload = await verifyAuthToken(token, secret);
  assert.equal(payload?.avatarUrl, avatarUrl, "verified JWT payload must retain the profile avatar URL");

  const session = await getNextServerSession({
    get: (name) => name === ALFIDA_SESSION_COOKIE ? { value: token } : undefined,
  }, secret);
  assert.equal(session?.avatarUrl, avatarUrl, "Next server session must expose the profile avatar URL");

  const previousSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = secret;
  try {
    const request: { headers: Record<string, string>; user?: Record<string, unknown> } = {
      headers: { cookie: `${ALFIDA_SESSION_COOKIE}=${encodeURIComponent(token)}` },
    };
    const guard = new ServiceJwtAuthGuard();
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as any;
    assert.equal(await guard.canActivate(context), true);
    assert.equal(request.user?.avatarUrl, avatarUrl, "Nest principal must expose the profile avatar URL");
  } finally {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
  }

  console.log("Auth avatar session contract passed");
}

void main();
