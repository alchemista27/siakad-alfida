import assert from "node:assert/strict";
import { lookupSsoUser } from "../src/lib/sso-server";

async function main() {
  const ok = await lookupSsoUser(
    "alfida_session=test",
    async () => new Response(JSON.stringify({ user: { id: "parent-1", roles: [{ app: "spmb", role: "orang_tua" }] } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
    "https://auth.example.test",
  );
  assert.deepEqual(ok, {
    status: 200,
    body: { user: { id: "parent-1", roles: [{ app: "spmb", role: "orang_tua" }] } },
  });

  const unauthorized = await lookupSsoUser(
    "",
    async () => new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    }),
    "https://auth.example.test",
  );
  assert.equal(unauthorized.status, 401);

  const htmlFailure = await lookupSsoUser(
    "alfida_session=test",
    async () => new Response("Internal Server Error", { status: 500, headers: { "content-type": "text/html" } }),
    "https://auth.example.test",
  );
  assert.equal(htmlFailure.status, 502);
  assert.doesNotMatch(htmlFailure.body.message, /Internal Server Error/i);

  const invalidPayload = await lookupSsoUser(
    "alfida_session=test",
    async () => new Response(JSON.stringify({}), { status: 200, headers: { "content-type": "application/json" } }),
    "https://auth.example.test",
  );
  assert.equal(invalidPayload.status, 502);

  const offline = await lookupSsoUser(
    "alfida_session=test",
    async () => { throw new Error("offline"); },
    "https://auth.example.test",
  );
  assert.equal(offline.status, 502);

  console.log("SPMB SSO server contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
