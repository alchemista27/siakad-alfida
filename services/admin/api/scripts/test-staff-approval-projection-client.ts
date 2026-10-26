import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  StaffApprovalProjectionClient,
  STAFF_APPROVAL_PROJECTION_FETCH,
} from "../src/users/staff-approval-projection.client";

const usersModuleSource = readFileSync(resolve(import.meta.dirname, "../src/users/users.module.ts"), "utf8");
const projectionClientSource = readFileSync(resolve(import.meta.dirname, "../src/users/staff-approval-projection.client.ts"), "utf8");

assert.match(
  projectionClientSource,
  /@Inject\(STAFF_APPROVAL_PROJECTION_FETCH\)[\s\S]*fetchImpl:\s*FetchLike/,
  "StaffApprovalProjectionClient must inject its fetch dependency with an explicit token",
);
assert.match(
  usersModuleSource,
  /\{\s*provide:\s*STAFF_APPROVAL_PROJECTION_FETCH,\s*useValue:\s*fetch\s*\}/,
  "UsersModule must register the StaffApprovalProjectionClient fetch provider",
);

const payload = {
  id: "00000000-0000-4000-8000-000000000001",
  fullName: "Guru Baru",
  email: "guru.baru@example.test",
  username: null,
  phone: "081234567890",
  avatarUrl: null,
  unitId: "00000000-0000-4000-8000-000000000002",
  employmentRole: "guru" as const,
};

async function main() {
  const oldUrl = process.env.SIMPEG_API_URL;
  const oldToken = process.env.SIMPEG_INTERNAL_SERVICE_TOKEN;
  process.env.SIMPEG_API_URL = "https://simpeg.example.test/";
  process.env.SIMPEG_INTERNAL_SERVICE_TOKEN = "test-internal-token";
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const client = new StaffApprovalProjectionClient((async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify({ id: payload.id }), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch);

  await client.provision(payload);
  assert.deepEqual(calls, [{
    url: `https://simpeg.example.test/api/internal/staff-approvals/users/${payload.id}`,
    init: {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "x-internal-service-token": "test-internal-token",
      },
      body: JSON.stringify(payload),
    },
  }]);

  delete process.env.SIMPEG_INTERNAL_SERVICE_TOKEN;
  assert.throws(() => client.assertConfigured(), /belum dikonfigurasi/i);

  if (oldUrl === undefined) delete process.env.SIMPEG_API_URL;
  else process.env.SIMPEG_API_URL = oldUrl;
  if (oldToken === undefined) delete process.env.SIMPEG_INTERNAL_SERVICE_TOKEN;
  else process.env.SIMPEG_INTERNAL_SERVICE_TOKEN = oldToken;
  console.log("Admin staff approval projection client contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
