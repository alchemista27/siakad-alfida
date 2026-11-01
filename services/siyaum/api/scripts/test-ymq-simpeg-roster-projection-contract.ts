import assert from "node:assert/strict";
import { SimpegYmqRosterProjectionClient } from "./ymq-2026-2027-import/simpeg-roster-projection";

const unitId = "00000000-0000-4000-8000-000000000002";
const directory = [{
  id: "00000000-0000-0000-0000-000000000003",
  fullName: "Peserta Satu",
  email: "peserta.satu@alfida.or.id",
  isActive: true,
  sourceUpdatedAt: "2026-11-01T00:00:00.000Z",
}];
const accounts = [{
  sourceKey: "ymq-2026-2027:peserta-satu",
  fullName: "Peserta Satu",
  normalizedName: "peserta satu",
  email: "peserta.satu@alfida.or.id",
  assignments: [{ app: "simpeg" as const, role: "pegawai" as const, unitId }],
}];

async function main() {
  const requests: Array<{ path: string; body: unknown; secret: string | null }> = [];
  const client = new SimpegYmqRosterProjectionClient({
    baseUrl: "https://simpeg.internal.test",
    serviceSecret: "test-internal-secret",
    fetchImplementation: async (url, init) => {
      requests.push({
        path: new URL(url).pathname,
        body: JSON.parse(String(init?.body)),
        secret: new Headers(init?.headers).get("x-internal-service-key"),
      });
      return Response.json({ users: 1, assignments: 1 });
    },
  });
  assert.deepEqual(await client.sync(directory, accounts), { users: 1, assignments: 1 });
  assert.deepEqual(requests, [{
    path: "/api/internal/ymq/roster-projections",
    secret: "test-internal-secret",
    body: {
      rosterVersion: "ymq-2026-2027",
      accounts: [{
        id: directory[0].id,
        fullName: directory[0].fullName,
        email: directory[0].email,
        isActive: true,
        sourceUpdatedAt: directory[0].sourceUpdatedAt,
        unitIds: [unitId],
      }],
    },
  }]);

  const malformed = new SimpegYmqRosterProjectionClient({
    baseUrl: "https://simpeg.internal.test",
    serviceSecret: "test-internal-secret",
    fetchImplementation: async () => Response.json({ users: "invalid" }),
  });
  await assert.rejects(() => malformed.sync(directory, accounts), /respons proyeksi SIMPEG/i);

  console.log("SIYAUM SIMPEG YMQ roster projection contract passed");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
