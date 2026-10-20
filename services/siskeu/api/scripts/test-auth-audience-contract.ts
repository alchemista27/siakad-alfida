import assert from "node:assert/strict";
import { UnauthorizedException } from "@nestjs/common";
import { createAuthToken } from "@alfida/auth-sdk";
import { SiskeuAuthGuard } from "../src/auth/siskeu-auth.guard";

const secret = "siskeu-guard-contract-secret";
const issuer = "https://auth.alfida.or.id";

function contextFor(token: string) {
  const request: { headers: Record<string, string>; cookies: Record<string, string>; user?: unknown } = {
    headers: { authorization: `Bearer ${token}` },
    cookies: {},
  };
  return {
    request,
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
    } as any,
  };
}

async function main() {
  const original = { ...process.env };
  try {
    process.env.AUTH_SECRET = secret;
    process.env.AUTH_JWT_ISSUER = issuer;
    delete process.env.AUTH_JWT_AUDIENCE;

    const token = await createAuthToken(
      { sub: "00000000-0000-4000-8000-000000000001", email: "finance@alfida.or.id", name: "Keuangan", roles: [] },
      secret,
      { issuer },
    );
    const withoutAudience = contextFor(token);
    const guardWithoutAudience = new SiskeuAuthGuard();
    assert.equal(await guardWithoutAudience.canActivate(withoutAudience.context), true, "SISKEU must accept a valid central-auth token when AUTH_JWT_AUDIENCE is not configured");
    assert.equal((withoutAudience.request.user as { id?: string }).id, "00000000-0000-4000-8000-000000000001");

    process.env.AUTH_JWT_AUDIENCE = "siskeu";
    const withUnexpectedAudience = contextFor(token);
    await assert.rejects(
      () => new SiskeuAuthGuard().canActivate(withUnexpectedAudience.context),
      (error: unknown) => error instanceof UnauthorizedException,
      "an explicit audience must remain enforced",
    );

    console.log("SISKEU auth audience contract passed");
  } finally {
    for (const key of Object.keys(process.env)) {
      if (!(key in original)) delete process.env[key];
    }
    Object.assign(process.env, original);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
