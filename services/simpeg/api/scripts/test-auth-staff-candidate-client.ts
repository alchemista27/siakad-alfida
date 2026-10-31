import assert from "node:assert/strict";
import { ServiceUnavailableException } from "@nestjs/common";
import {
  AuthStaffCandidateClient,
} from "../src/employees/auth-staff-candidate.client";

const originalAuthApiUrl = process.env.AUTH_API_URL;
const originalInternalToken = process.env.AUTH_INTERNAL_SERVICE_TOKEN;
const originalInternalSecret = process.env.INTERNAL_SERVICE_SECRET;

function restoreEnvironment() {
  if (originalAuthApiUrl === undefined) delete process.env.AUTH_API_URL;
  else process.env.AUTH_API_URL = originalAuthApiUrl;
  if (originalInternalToken === undefined) delete process.env.AUTH_INTERNAL_SERVICE_TOKEN;
  else process.env.AUTH_INTERNAL_SERVICE_TOKEN = originalInternalToken;
  if (originalInternalSecret === undefined) delete process.env.INTERNAL_SERVICE_SECRET;
  else process.env.INTERNAL_SERVICE_SECRET = originalInternalSecret;
}

async function main() {
  const requests: Array<{ input: URL | RequestInfo; init?: RequestInit }> = [];
  const candidate = { id: "employee-1", fullName: "Guru Aktif", email: "guru@example.test", avatarUrl: null };
  const client = new AuthStaffCandidateClient(async (input, init) => {
    requests.push({ input, init });
    return Response.json([candidate]);
  });

  delete process.env.AUTH_API_URL;
  delete process.env.AUTH_INTERNAL_SERVICE_TOKEN;
  delete process.env.INTERNAL_SERVICE_SECRET;
  await assert.rejects(() => client.find("guru"), ServiceUnavailableException, "missing config must fail before fetch");
  assert.equal(requests.length, 0);

  process.env.AUTH_API_URL = "https://auth.example.test/";
  process.env.INTERNAL_SERVICE_SECRET = "test-secret";
  assert.deepEqual(await client.find(" Guru "), [candidate]);
  assert.equal(String(requests[0]?.input), "https://auth.example.test/api/users/internal-staff-candidates?search=Guru");
  assert.equal((requests[0]?.init?.headers as Record<string, string>)["x-internal-service-token"], "test-secret");
  assert.equal((requests[0]?.init?.headers as Record<string, string>).Accept, "application/json");
  assert.equal((requests[0]?.init?.method), "GET");

  const ineligible = new AuthStaffCandidateClient(async () => new Response(null, { status: 404 }));
  assert.equal(await ineligible.isEligible("parent-only"), false, "Auth 404 must mean ineligible candidate");

  const malformed = new AuthStaffCandidateClient(async () => Response.json([{ id: "bad" }]));
  await assert.rejects(() => malformed.find("bad"), ServiceUnavailableException, "malformed Auth payload must fail closed");

  const unavailable = new AuthStaffCandidateClient(async () => new Response(null, { status: 503 }));
  await assert.rejects(() => unavailable.isEligible("employee-1"), ServiceUnavailableException, "non-404 Auth failures must not become eligibility grants");

  restoreEnvironment();
  console.log("Auth staff-candidate client contract passed");
}

main().catch((error) => {
  restoreEnvironment();
  console.error(error);
  process.exitCode = 1;
});
