import assert from "node:assert/strict";
import { syncYmqAuthProjectionUsers } from "./ymq-2026-2027-import/auth-projection";

const unitId = "00000000-0000-4000-8000-000000000002";
const directory = [
  {
    id: "00000000-0000-4000-8000-000000000003",
    fullName: "Peserta Satu",
    email: "peserta.satu@alfida.or.id",
    isActive: true,
    sourceUpdatedAt: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    fullName: "Pembina Multi",
    email: "pembina.multi@alfida.or.id",
    isActive: true,
    sourceUpdatedAt: "2026-11-01T00:00:00.000Z",
  },
];
const accounts = [
  {
    sourceKey: "ymq-2026-2027:peserta-satu",
    fullName: "Peserta Satu",
    normalizedName: "peserta satu",
    email: "peserta.satu@alfida.or.id",
    assignments: [{ app: "simpeg" as const, role: "pegawai" as const, unitId }],
  },
  {
    sourceKey: "ymq-2026-2027:pembina-multi",
    fullName: "Pembina Multi",
    normalizedName: "pembina multi",
    email: "pembina.multi@alfida.or.id",
    assignments: [
      { app: "simpeg" as const, role: "pegawai" as const, unitId },
      { app: "simpeg" as const, role: "pegawai" as const, unitId: "00000000-0000-4000-8000-000000000005" },
    ],
  },
];

async function main() {
  const writes: Array<{ mode: string; data: Record<string, unknown> }> = [];
  const existing = new Map<string, { sourceUpdatedAt: Date | null }>();
  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => existing.get(where.id) ?? null,
      create: async ({ data }: { data: Record<string, unknown> }) => { writes.push({ mode: "create", data }); },
      update: async ({ data }: { data: Record<string, unknown> }) => { writes.push({ mode: "update", data }); },
    },
  };

  assert.deepEqual(await syncYmqAuthProjectionUsers(prisma as any, directory, accounts), { created: 2, updated: 0, unchanged: 0 });
  assert.deepEqual(writes[0], {
    mode: "create",
    data: {
      id: directory[0].id,
      fullName: directory[0].fullName,
      email: directory[0].email,
      isActive: true,
      sourceUpdatedAt: new Date(directory[0].sourceUpdatedAt),
      unitId,
      unitName: null,
    },
  });
  assert.equal(writes[1].data.unitId, null, "a multi-unit pembina must not receive a fake primary unit");

  existing.set(directory[0].id, { sourceUpdatedAt: new Date(directory[0].sourceUpdatedAt) });
  const unchanged = await syncYmqAuthProjectionUsers(prisma as any, [directory[0]], [accounts[0]]);
  assert.deepEqual(unchanged, { created: 0, updated: 0, unchanged: 1 });

  await assert.rejects(
    () => syncYmqAuthProjectionUsers(prisma as any, [directory[0]], []),
    /account plan/i,
    "directory users must map exactly to an account plan entry",
  );

  console.log("SIYAUM Auth projection contract passed");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
