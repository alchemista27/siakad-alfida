import assert from "node:assert/strict";

import { repairDepartmentMemberOutboxPayloads } from "./repair-department-member-outbox-payloads";

async function main() {
  const rows = [
    {
      id: "member-bad",
      status: "failed",
      aggregate: "department_member",
      eventType: "department-member.upserted",
      payload: {
        id: "00000000-0000-4000-8000-000000000101",
        departmentId: "00000000-0000-4000-8000-000000000102",
        userId: "00000000-0000-4000-8000-000000000103",
        role: null,
        sourceCreatedAt: "2026-10-20T00:00:00.000Z",
        sourceUpdatedAt: "2026-10-20T00:00:00.000Z",
      },
    },
    {
      id: "member-good",
      status: "failed",
      aggregate: "department_member",
      eventType: "department-member.upserted",
      payload: {
        id: "00000000-0000-4000-8000-000000000104",
        departmentId: "00000000-0000-4000-8000-000000000102",
        userId: "00000000-0000-4000-8000-000000000103",
        role: null,
        sourceUpdatedAt: "2026-10-20T00:00:00.000Z",
      },
    },
    {
      id: "other-event",
      status: "failed",
      aggregate: "user",
      eventType: "user.projected",
      payload: { sourceCreatedAt: "2026-10-20T00:00:00.000Z" },
    },
  ];
  const updates: Array<{ where: unknown; data: Record<string, unknown> }> = [];
  const prisma = {
    organizationSyncOutbox: {
      findMany: async () => rows,
      updateMany: async (input: { where: unknown; data: Record<string, unknown> }) => {
        updates.push(input);
        return { count: 1 };
      },
    },
  };

  assert.deepEqual(
    await repairDepartmentMemberOutboxPayloads(prisma, false),
    { candidates: 1, repaired: 0 },
    "dry-run must identify only stale member payloads and make no writes",
  );
  assert.equal(updates.length, 0);

  assert.deepEqual(
    await repairDepartmentMemberOutboxPayloads(prisma, true),
    { candidates: 1, repaired: 1 },
    "apply must repair exactly the malformed member event",
  );
  assert.equal(updates.length, 1);
  assert.deepEqual(updates[0].where, { id: "member-bad", status: { in: ["failed", "pending"] } });
  assert.deepEqual(updates[0].data.payload, {
    id: "00000000-0000-4000-8000-000000000101",
    departmentId: "00000000-0000-4000-8000-000000000102",
    userId: "00000000-0000-4000-8000-000000000103",
    role: null,
    sourceUpdatedAt: "2026-10-20T00:00:00.000Z",
  });
  assert.equal(updates[0].data.status, "pending");
  assert.equal(updates[0].data.lastError, null);
  console.log("Department-member outbox repair contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
