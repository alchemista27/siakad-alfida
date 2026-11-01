import assert from "node:assert/strict";
import {
  AuthRosterBrokerClient,
  type AuthRosterPreviewInput,
} from "./ymq-2026-2027-import/auth-roster-broker";

const actorUserId = "00000000-0000-4000-8000-000000000001";
const unitId = "00000000-0000-4000-8000-000000000002";
const previewInput: AuthRosterPreviewInput = {
  actorUserId,
  rosterVersion: "ymq-2026-2027",
  accounts: [{
    sourceKey: "ymq-2026-2027:abdul-rahmat",
    fullName: "Abdul Rahmat",
    email: "abdul.rahmat@alfida.or.id",
    assignments: [
      { app: "simpeg", role: "pegawai", unitId },
      { app: "siyaum", role: "peserta", unitId: null },
    ],
  }],
};

async function main() {
  const requests: Array<{ path: string; body: unknown; secret: string | null }> = [];
  const client = new AuthRosterBrokerClient({
    baseUrl: "https://auth.internal.test",
    serviceSecret: "test-internal-secret",
    fetchImplementation: async (url, init) => {
      requests.push({
        path: new URL(url).pathname,
        body: JSON.parse(String(init?.body)),
        secret: new Headers(init?.headers).get("x-internal-service-key"),
      });
      return new Response(JSON.stringify({
        accounts: [{
          sourceKey: previewInput.accounts[0].sourceKey,
          status: "created",
          desiredRoles: previewInput.accounts[0].assignments,
          conflicts: [],
        }],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    },
  });
  assert.deepEqual(await client.preview(previewInput), {
    accounts: [{
      sourceKey: previewInput.accounts[0].sourceKey,
      status: "created",
      desiredRoles: previewInput.accounts[0].assignments,
      conflicts: [],
    }],
  });
  assert.deepEqual(requests, [{
    path: "/api/internal/ymq-roster-broker/preview",
    body: previewInput,
    secret: "test-internal-secret",
  }]);

  const provisionClient = new AuthRosterBrokerClient({
    baseUrl: "https://auth.internal.test",
    serviceSecret: "test-internal-secret",
    initialPassword: "contract-only-password",
    fetchImplementation: async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      assert.equal(body.initialPassword, "contract-only-password");
      return new Response(JSON.stringify({ accounts: [{
        id: "00000000-0000-4000-8000-000000000003",
        fullName: "Abdul Rahmat",
        email: "abdul.rahmat@alfida.or.id",
        isActive: true,
        sourceUpdatedAt: "2026-11-01T00:00:00.000Z",
      }] }), { status: 200, headers: { "Content-Type": "application/json" } });
    },
  });
  assert.deepEqual(await provisionClient.provision(previewInput), {
    accounts: [{
      id: "00000000-0000-4000-8000-000000000003",
      fullName: "Abdul Rahmat",
      email: "abdul.rahmat@alfida.or.id",
      isActive: true,
      sourceUpdatedAt: "2026-11-01T00:00:00.000Z",
    }],
  });

  assert.throws(
    () => new AuthRosterBrokerClient({ baseUrl: "https://auth.internal.test", serviceSecret: "test-internal-secret" }).provision(previewInput),
    /YMQ_INITIAL_PASSWORD/i,
    "provision must fail before sending a request without the runtime password",
  );

  const rejected = new AuthRosterBrokerClient({
    baseUrl: "https://auth.internal.test",
    serviceSecret: "test-internal-secret",
    fetchImplementation: async () => new Response(JSON.stringify({ message: "invalid roster" }), { status: 400 }),
  });
  await assert.rejects(() => rejected.preview(previewInput), /broker Auth menolak/i);

  const malformed = new AuthRosterBrokerClient({
    baseUrl: "https://auth.internal.test",
    serviceSecret: "test-internal-secret",
    initialPassword: "contract-only-password",
    fetchImplementation: async () => new Response(JSON.stringify({ accounts: [{ id: "not-a-uuid" }] }), { status: 200 }),
  });
  await assert.rejects(() => malformed.provision(previewInput), /respons Auth roster/i);

  console.log("SIYAUM Auth roster broker contract passed");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
