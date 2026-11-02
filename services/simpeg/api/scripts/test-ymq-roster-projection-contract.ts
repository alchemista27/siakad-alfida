import assert from "node:assert/strict";
import {
  parseYmqRosterProjection,
  YmqRosterProjectionService,
} from "../src/ymq-projection/ymq-roster-projection.service";

const userId = "00000000-0000-0000-0000-000000000001";
const unitA = "22222222-2222-4222-8222-222222222222";
const unitB = "33333333-3333-4333-8333-333333333333";
const sourceUpdatedAt = "2026-11-01T00:00:00.000Z";

async function main() {
  const payload = {
    rosterVersion: "ymq-2026-2027",
    accounts: [{
      id: userId,
      fullName: "Pembina Multi",
      email: "pembina.multi@alfida.or.id",
      isActive: true,
      sourceUpdatedAt,
      unitIds: [unitB, unitA, unitB],
    }],
  };
  const parsed = parseYmqRosterProjection(payload);
  assert.deepEqual(parsed.accounts[0]?.unitIds, [unitA, unitB], "unit placement must be deduplicated and deterministic");
  assert.throws(() => parseYmqRosterProjection({ ...payload, sourceKey: "forbidden" }));
  assert.throws(() => parseYmqRosterProjection({ ...payload, accounts: [{ ...payload.accounts[0], passwordHash: "forbidden" }] }));

  const writes: Array<{ model: string; data: Record<string, unknown> }> = [];
  const prisma = {
    unit: {
      findMany: async () => [
        { id: unitA, name: "Unit A", isActive: true },
        { id: unitB, name: "Unit B", isActive: true },
      ],
    },
    $transaction: async (callback: (tx: any) => Promise<unknown>) => callback({
      user: { upsert: async ({ create }: { create: Record<string, unknown> }) => writes.push({ model: "user", data: create }) },
      employeeUnitAssignment: {
        findFirst: async () => null,
        upsert: async ({ create }: { create: Record<string, unknown> }) => writes.push({ model: "assignment", data: create }),
      },
    }),
  };
  const result = await new YmqRosterProjectionService(prisma as any).upsert(parsed);
  assert.deepEqual(result, { users: 1, assignments: 2 });
  assert.equal(writes[0]?.model, "user");
  const assignments = writes.filter((write) => write.model === "assignment").map((write) => write.data);
  assert.deepEqual(assignments.map((assignment) => assignment.sourceKey), [
    `ymq-2026-2027:${userId}:${unitA}`,
    `ymq-2026-2027:${userId}:${unitB}`,
  ]);
  assert.deepEqual(assignments.map((assignment) => assignment.isPrimary), [true, false]);
  assert.ok(assignments.every((assignment) => assignment.role === "karyawan"));

  const leader = parseYmqRosterProjection({
    rosterVersion: "ymq-2026-2027",
    accounts: [{
      id: "00000000-0000-0000-0000-000000000009",
      fullName: "Pimpinan YMQ",
      email: "pimpinan.ymq@alfida.or.id",
      isActive: true,
      sourceUpdatedAt,
      unitIds: [],
    }],
  });
  const leaderWrites: Array<{ model: string; data: Record<string, unknown> }> = [];
  const leaderPrisma = {
    unit: { findMany: async () => [] },
    $transaction: async (callback: (tx: any) => Promise<unknown>) => callback({
      user: { upsert: async ({ create }: { create: Record<string, unknown> }) => leaderWrites.push({ model: "user", data: create }) },
      employeeUnitAssignment: {
        findFirst: async () => null,
        upsert: async ({ create }: { create: Record<string, unknown> }) => leaderWrites.push({ model: "assignment", data: create }),
      },
    }),
  };
  assert.deepEqual(await new YmqRosterProjectionService(leaderPrisma as any).upsert(leader), { users: 1, assignments: 0 });
  assert.deepEqual(leaderWrites.map((write) => write.model), ["user"], "a SIMPEG leader without a unit remains visible in SIMPEG without an employee-unit assignment");

  console.log("SIMPEG YMQ roster projection contract passed");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
