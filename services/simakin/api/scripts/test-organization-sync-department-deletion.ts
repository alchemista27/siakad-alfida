import assert from "node:assert/strict";
import "reflect-metadata";
import { OrganizationSyncService } from "../src/strategic/organization-sync/organization-sync.service";

const updates: any[] = [];
const prisma = {
  department: {
    async upsert(input: any) { updates.push(input); return { id: input.where.id, ...input.update }; },
  },
};

async function main() {
  const service = new OrganizationSyncService(prisma as any);
  await service.deleteDepartment("00000000-0000-4000-8000-000000000201", {
    id: "00000000-0000-4000-8000-000000000201",
    deletedAt: "2026-10-16T00:00:00.000Z",
  });
  assert.equal(updates.length, 1);
  assert.deepEqual(updates[0].where, { id: "00000000-0000-4000-8000-000000000201" });
  assert.equal(updates[0].update.isActive, false);
  assert.ok(updates[0].update.archivedAt instanceof Date);
  assert.equal(updates[0].create.isActive, false, "a missed projection must create an inactive tombstone");
  console.log("SIMAKIN department deletion contract passed");
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });
