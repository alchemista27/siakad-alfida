import assert from "node:assert/strict";
import { SpmbObserverRoleBrokerClient } from "../src/observers/spmb-observer-role-broker.client";

async function main() {
  const previousUrl = process.env.AUTH_API_URL;
  const previousToken = process.env.AUTH_INTERNAL_SERVICE_TOKEN;
  const previousPublicUrl = process.env.NEXT_PUBLIC_AUTH_URL;
  const previousSharedToken = process.env.INTERNAL_SERVICE_SECRET;
  process.env.AUTH_API_URL = "https://auth.internal.test";
  process.env.AUTH_INTERNAL_SERVICE_TOKEN = "test-token";

  const calls: Array<{ url: string; init: RequestInit }> = [];
  const client = new SpmbObserverRoleBrokerClient(async (url, init) => {
    calls.push({ url: String(url), init: init || {} });
    return new Response("{}", { status: 200, headers: { "content-type": "application/json" } });
  });

  try {
    await client.grant("unit-a", "user-a");
    await client.revoke("unit-a", "user-a");
    delete process.env.AUTH_API_URL;
    delete process.env.AUTH_INTERNAL_SERVICE_TOKEN;
    process.env.NEXT_PUBLIC_AUTH_URL = "https://auth-public.test";
    process.env.INTERNAL_SERVICE_SECRET = "shared-test-token";
    await client.grant("unit-a", "user-a");
  } finally {
    if (previousUrl === undefined) delete process.env.AUTH_API_URL;
    else process.env.AUTH_API_URL = previousUrl;
    if (previousToken === undefined) delete process.env.AUTH_INTERNAL_SERVICE_TOKEN;
    else process.env.AUTH_INTERNAL_SERVICE_TOKEN = previousToken;
    if (previousPublicUrl === undefined) delete process.env.NEXT_PUBLIC_AUTH_URL;
    else process.env.NEXT_PUBLIC_AUTH_URL = previousPublicUrl;
    if (previousSharedToken === undefined) delete process.env.INTERNAL_SERVICE_SECRET;
    else process.env.INTERNAL_SERVICE_SECRET = previousSharedToken;
  }

  assert.equal(calls[0]?.url, "https://auth.internal.test/api/users/internal-organization-roles");
  assert.equal(calls[0]?.init.method, "POST");
  assert.equal((calls[0]?.init.headers as Record<string, string>)["x-internal-service-token"], "test-token");
  assert.deepEqual(JSON.parse(String(calls[0]?.init.body)), { userId: "user-a", scope: "unit", unitId: "unit-a", app: "spmb", role: "observer" });
  assert.equal(calls[1]?.init.method, "DELETE");
  assert.equal(calls[2]?.url, "https://auth-public.test/api/users/internal-organization-roles");
  assert.equal((calls[2]?.init.headers as Record<string, string>)["x-internal-service-token"], "shared-test-token");

  console.log("SPMB observer role broker client contract passed");
}

void main();
