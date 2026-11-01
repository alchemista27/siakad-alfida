import assert from "node:assert/strict";
import { SimpegYmqProjectionClient } from "../src/employees/simpeg-ymq-projection.client";
import {
  mapYmqEmployeeProjection,
  shouldApplyEmployeeProjection,
} from "../src/employees/ymq-employee-projection.policy";

const source = {
  userId: "11111111-1111-4111-8111-111111111111",
  fullName: "Pegawai Contoh",
  email: "pegawai@example.test",
  unitId: "22222222-2222-4222-8222-222222222222",
  unitName: "SD Islam Terpadu Iqra 1",
  isActive: true,
  sourceUpdatedAt: "2026-10-22T00:00:00.000Z",
};

assert.deepEqual(mapYmqEmployeeProjection(source), source);
assert.throws(() => mapYmqEmployeeProjection({ ...source, passwordHash: "not-allowed" }));
assert.equal(shouldApplyEmployeeProjection(null, source.sourceUpdatedAt), true);
assert.equal(shouldApplyEmployeeProjection(new Date("2026-10-22T00:00:00.000Z"), source.sourceUpdatedAt), false);
assert.equal(shouldApplyEmployeeProjection(new Date("2026-10-23T00:00:00.000Z"), source.sourceUpdatedAt), false);
assert.equal(shouldApplyEmployeeProjection(new Date("2026-10-21T00:00:00.000Z"), source.sourceUpdatedAt), true);

async function testProjectionEnvelope() {
  const originalUrl = process.env.SIMPEG_INTERNAL_API_URL;
  const originalSecret = process.env.INTERNAL_SERVICE_SECRET;
  process.env.SIMPEG_INTERNAL_API_URL = "https://simpeg.internal.test";
  process.env.INTERNAL_SERVICE_SECRET = "test-secret";
  try {
    const client = new SimpegYmqProjectionClient(async () => new Response(JSON.stringify({ employees: [source] }), { status: 200, headers: { "Content-Type": "application/json" } }));
    assert.deepEqual(await client.list({}), [source]);
  } finally {
    if (originalUrl === undefined) delete process.env.SIMPEG_INTERNAL_API_URL;
    else process.env.SIMPEG_INTERNAL_API_URL = originalUrl;
    if (originalSecret === undefined) delete process.env.INTERNAL_SERVICE_SECRET;
    else process.env.INTERNAL_SERVICE_SECRET = originalSecret;
  }
}

void testProjectionEnvelope().then(() => console.log("SIYAUM YMQ employee projection contract passed"));
