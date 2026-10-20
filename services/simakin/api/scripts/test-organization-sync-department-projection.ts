import assert from "node:assert/strict";
import "reflect-metadata";
import { OrganizationSyncService } from "../src/strategic/organization-sync/organization-sync.service";

const id = "00000000-0000-4000-8000-000000000301";
const unitId = "00000000-0000-4000-8000-000000000302";
const parentId = "00000000-0000-4000-8000-000000000303";
const leaderId = "00000000-0000-4000-8000-000000000304";
const sourceUpdatedAt = "2026-10-20T23:20:00.000Z";

async function main() {
  const updates: unknown[] = [];
  const prisma = {
    department: {
      async updateMany(input: unknown) {
        updates.push(input);
        return { count: 1 };
      },
      async findUnique() {
        return { id };
      },
      async create() {
        throw new Error("create must not run when the source version is newer");
      },
    },
  };
  const service = new OrganizationSyncService(prisma as never);
  await service.syncDepartment(id, {
    id,
    unitId,
    parentId,
    leaderId,
    name: " Biro Strategis ",
    code: " str ",
    description: " Sinkronisasi organisasi ",
    isActive: true,
    updatedAt: sourceUpdatedAt,
  });

  assert.deepEqual(updates, [
    {
      where: { id, OR: [{ sourceUpdatedAt: null }, { sourceUpdatedAt: { lt: new Date(sourceUpdatedAt) } }] },
      data: {
        unitId,
        parentId,
        leaderId,
        name: "Biro Strategis",
        code: "STR",
        description: "Sinkronisasi organisasi",
        isActive: true,
        source: "simpeg",
        sourceUpdatedAt: new Date(sourceUpdatedAt),
        archivedAt: null,
      },
    },
  ]);
  const stale = { id, name: "Versi terbaru", sourceUpdatedAt: "2026-10-20T23:21:00.000Z" };
  const stalePrisma = {
    department: {
      async updateMany() {
        return { count: 0 };
      },
      async findUnique() {
        return stale;
      },
      async create() {
        throw { code: "P2002" };
      },
    },
  };
  const staleService = new OrganizationSyncService(stalePrisma as never);
  assert.equal(
    await staleService.syncDepartment(id, {
      id,
      unitId: null,
      parentId: null,
      leaderId: null,
      name: "Versi lama",
      code: "OLD",
      description: null,
      isActive: false,
      updatedAt: sourceUpdatedAt,
    }),
    stale,
    "a stale department projection must leave the newer row unchanged",
  );
  await assert.rejects(
    () => service.syncDepartment(id, { id: "00000000-0000-4000-8000-000000000305", name: "x", code: "x", isActive: true, updatedAt: sourceUpdatedAt }),
    /ID path dan body harus sama/,
  );
  console.log("SIMAKIN department projection version contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
