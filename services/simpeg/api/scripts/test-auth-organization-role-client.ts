import assert from "node:assert/strict";
import { AuthOrganizationRoleClient } from "../src/organization-sync/auth-organization-role.client";

const userId = "00000000-0000-4000-8000-000000000001";
const unitId = "00000000-0000-4000-8000-000000000002";
const departmentId = "00000000-0000-4000-8000-000000000003";

type RequestRecord = {
  url: string;
  method: string | undefined;
  headers: Record<string, string>;
  body: unknown;
};

async function main() {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.AUTH_API_URL;
  const originalToken = process.env.AUTH_INTERNAL_SERVICE_TOKEN;
  const requests: RequestRecord[] = [];

  try {
    process.env.AUTH_API_URL = "https://auth.example.test";
    process.env.AUTH_INTERNAL_SERVICE_TOKEN = "test-internal-token";
    globalThis.fetch = (async (input, init) => {
      const headers = new Headers(init?.headers);
      requests.push({
        url: String(input),
        method: init?.method,
        headers: Object.fromEntries(headers.entries()),
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      });
      if (init?.method === "POST") {
        return new Response(JSON.stringify({ id: "auth-role-id" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ deleted: false }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const client = new AuthOrganizationRoleClient();
    const granted = await client.grant({
      scope: "unit",
      userId,
      unitId,
      app: "simpeg",
      role: "admin_unit",
    });
    assert.equal(granted.id, "auth-role-id");
    await client.revoke({
      scope: "department",
      userId,
      departmentId,
      app: "simakin",
      role: "admin_bidang",
    });

    assert.deepEqual(requests, [
      {
        url: "https://auth.example.test/api/users/internal-organization-roles",
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-internal-service-token": "test-internal-token",
        },
        body: { scope: "unit", userId, unitId, app: "simpeg", role: "admin_unit" },
      },
      {
        url: "https://auth.example.test/api/users/internal-organization-roles",
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          "x-internal-service-token": "test-internal-token",
        },
        body: { scope: "department", userId, departmentId, app: "simakin", role: "admin_bidang" },
      },
    ]);
    assert.equal("authorization" in requests[0].headers, false, "browser authorization must never be forwarded");

    process.env.AUTH_API_URL = "";
    await assert.rejects(
      () => client.grant({ scope: "unit", userId, unitId, app: "simpeg", role: "admin_unit" }),
      /not configured/,
    );
    assert.equal(requests.length, 2, "missing configuration must fail before fetch");

    process.env.AUTH_API_URL = "https://auth.example.test";
    globalThis.fetch = (async () => new Response("nope", { status: 401 })) as typeof fetch;
    await assert.rejects(
      () => client.revoke({ scope: "unit", userId, unitId, app: "simpeg", role: "admin_unit" }),
      /revoke rejected with HTTP 401/,
    );

    globalThis.fetch = (async () => new Response(JSON.stringify({}), {
      status: 200,
      headers: { "content-type": "application/json" },
    })) as typeof fetch;
    await assert.rejects(
      () => client.grant({ scope: "unit", userId, unitId, app: "simpeg", role: "admin_unit" }),
      /returned no assignment id/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.AUTH_API_URL;
    else process.env.AUTH_API_URL = originalUrl;
    if (originalToken === undefined) delete process.env.AUTH_INTERNAL_SERVICE_TOKEN;
    else process.env.AUTH_INTERNAL_SERVICE_TOKEN = originalToken;
  }

  console.log("Auth organization role client contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
