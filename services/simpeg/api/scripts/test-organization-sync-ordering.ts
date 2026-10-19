import assert from "node:assert/strict";
import { OrganizationSyncService } from "../src/organization-sync/organization-sync.service";

const userId = "00000000-0000-4000-8000-000000000301";
const newer = new Date("2026-10-18T10:00:02.000Z");
const older = new Date("2026-10-18T10:00:01.000Z");

async function main() {
  const events: any[] = [];
  const source = new OrganizationSyncService();
  await source.enqueueUser({ organizationSyncOutbox: { async upsert(input: any) { events.push(input.create); return input.create; } } }, {
    id: userId,
    fullName: "Versi Dua",
    email: "version@example.test",
    username: null,
    avatarUrl: null,
    isActive: true,
    updatedAt: newer,
  });
  assert.equal(events[0].payload.sourceUpdatedAt, newer.toISOString(), "SIMPEG must source projection version from user.updatedAt");
  assert.match(events[0].idempotencyKey, new RegExp(`${newer.toISOString()}$`), "user outbox idempotency must use the stable source version");

  const { OrganizationUsersSyncService } = await import("../../../simakin/api/src/strategic/organization-sync/users.service");
  let row: any = null;
  const prisma = {
    user: {
      async updateMany({ where, data }: any) {
        const canUpdate = row
          && row.id === where.id
          && (row.sourceUpdatedAt === null || row.sourceUpdatedAt < where.OR[1].sourceUpdatedAt.lt);
        if (!canUpdate) return { count: 0 };
        row = { ...row, ...data };
        return { count: 1 };
      },
      async create({ data }: any) {
        if (row) {
          const error: any = new Error("unique conflict");
          error.code = "P2002";
          throw error;
        }
        row = { ...data };
        return { ...row };
      },
      async findUnique() { return row ? { ...row } : null; },
      async upsert({ create, update }: any) {
        row = row ? { ...row, ...update } : { ...create };
        return { ...row };
      },
    },
    async $transaction(callback: any) { return callback(this); },
  };
  const receiver = new OrganizationUsersSyncService(prisma as any);
  await receiver.sync(userId, { id: userId, fullName: "Versi Dua", email: "version@example.test", username: null, avatarUrl: null, isActive: true, sourceUpdatedAt: newer.toISOString() });
  await Promise.all([
    receiver.sync(userId, { id: userId, fullName: "Versi Satu Stale", email: "version@example.test", username: null, avatarUrl: null, isActive: false, sourceUpdatedAt: older.toISOString() }),
    receiver.sync(userId, { id: userId, fullName: "Versi Satu Stale", email: "version@example.test", username: null, avatarUrl: null, isActive: false, sourceUpdatedAt: older.toISOString() }),
  ]);
  assert.equal(row.fullName, "Versi Dua", "concurrent stale v1 deliveries must never overwrite v2");
  assert.equal(row.isActive, true);
  assert.equal(new Date(row.sourceUpdatedAt).toISOString(), newer.toISOString());
  console.log("Organization sync ordering contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
