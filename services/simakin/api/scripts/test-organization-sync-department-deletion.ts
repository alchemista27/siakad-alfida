import assert from "node:assert/strict";
import "reflect-metadata";
import { OrganizationSyncService } from "../src/strategic/organization-sync/organization-sync.service";

const updates: unknown[] = [];
const prisma = {
  department: {
    async updateMany(input: unknown) {
      updates.push(input);
      return { count: 1 };
    },
    async findUnique() {
      return { id: "00000000-0000-4000-8000-000000000201" };
    },
    async create() {
      throw new Error("create must not run when the source version is newer");
    },
  },
};

async function main() {
  const service = new OrganizationSyncService(prisma as any);
  await service.deleteDepartment("00000000-0000-4000-8000-000000000201", {
    id: "00000000-0000-4000-8000-000000000201",
    deletedAt: "2026-10-16T00:00:00.000Z",
  });
  assert.equal(updates.length, 1);
  assert.deepEqual(updates[0], {
    where: {
      id: "00000000-0000-4000-8000-000000000201",
      OR: [{ sourceUpdatedAt: null }, { sourceUpdatedAt: { lt: new Date("2026-10-16T00:00:00.000Z") } }],
    },
    data: {
      isActive: false,
      archivedAt: new Date("2026-10-16T00:00:00.000Z"),
      source: "simpeg",
      sourceUpdatedAt: new Date("2026-10-16T00:00:00.000Z"),
    },
  });
  console.log("SIMAKIN department deletion contract passed");
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });
