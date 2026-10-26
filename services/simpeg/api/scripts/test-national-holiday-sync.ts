import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// RED is an explicit missing-adapter assertion, not an accidental import error.
assert.ok(existsSync(resolve(__dirname, "../src/attendance/holiday-provider.client.ts")), "API Indonesia holiday provider adapter must exist");
assert.ok(existsSync(resolve(__dirname, "../src/attendance/national-holiday-sync.ts")), "National holiday sync service must exist");

const fixture = {
  data: [
    { id: "hol_2026_001", date: "2026-01-01", name: "Tahun Baru 2026 Masehi", type: "nasional", is_joint_leave: 0, description: null, source: "SKB 3 Menteri", year: 2026, is_active: 1 },
    { id: "hol_2026_002", date: "2026-01-02", name: "Cuti Bersama", type: "nasional", is_joint_leave: 1, description: null, source: "SKB 3 Menteri", year: 2026, is_active: 1 },
    { id: "hol_2026_003", date: "2026-01-03", name: "Tidak Aktif", type: "nasional", is_joint_leave: 0, description: null, source: "SKB 3 Menteri", year: 2026, is_active: 0 },
  ],
};

type Row = { id: string; unitId: string | null; date: Date; name: string; description: string | null; source: string; providerKey: string | null; providerSyncedAt: Date | null };
function memoryStore(initial: Row[] = []) {
  const rows = initial;
  const counts = { create: 0, update: 0 };
  return {
    rows, counts,
    holiday: {
      async findFirst({ where }: { where: { unitId?: null; date?: Date; providerKey?: string } }) {
        return rows.find((r) => (where.unitId === undefined || r.unitId === where.unitId) && (!where.date || r.date.getTime() === where.date.getTime()) && (!where.providerKey || r.providerKey === where.providerKey)) ?? null;
      },
      async create({ data }: { data: Omit<Row, "id"> }) {
        counts.create++;
        if (rows.some((r) => r.unitId === null && data.unitId === null && r.date.getTime() === data.date.getTime()) || rows.some((r) => r.providerKey && r.providerKey === data.providerKey)) {
          throw { code: "P2002" };
        }
        const row = { id: `row-${rows.length + 1}`, ...data };
        rows.push(row);
        return row;
      },
      async updateMany({ where, data }: { where: Partial<Row>; data: Partial<Row> }) {
        const row = rows.find((r) => Object.entries(where).every(([key, value]) => (r as any)[key] instanceof Date ? (r as any)[key].getTime() === (value as Date).getTime() : (r as any)[key] === value));
        if (!row) return { count: 0 };
        counts.update++;
        Object.assign(row, data);
        return { count: 1 };
      },
    },
  };
}

async function main() {
  const schema = readFileSync(resolve(__dirname, "../prisma/schema.prisma"), "utf8");
  const migrationPath = resolve(__dirname, "../prisma/migrations/20261024030000_holiday_provider_provenance/migration.sql");
  assert.ok(existsSync(migrationPath), "Provider provenance migration must exist");
  const migration = readFileSync(migrationPath, "utf8");
  assert.match(schema, /providerKey\s+String\?/);
  assert.match(migration, /UPDATE "holidays" SET "source" = 'legacy' WHERE "unit_id" IS NULL/);
  const { parseApiIndonesiaHolidays, fetchApiIndonesiaHolidays } = await import("../src/attendance/holiday-provider.client");
  const { syncNationalHolidays } = await import("../src/attendance/national-holiday-sync");
  const parsed = parseApiIndonesiaHolidays(fixture, 2026);
  assert.deepEqual(parsed, [{ key: "apiindonesia:hol_2026_001", date: "2026-01-01", name: "Tahun Baru 2026 Masehi", kind: "national" }]);
  const store = memoryStore();
  assert.deepEqual(await syncNationalHolidays(store, parsed), { created: 1, updated: 0, unchanged: 0, conflicts: 0, total: 1 });
  assert.deepEqual(await syncNationalHolidays(store, parsed), { created: 0, updated: 0, unchanged: 1, conflicts: 0, total: 1 });
  assert.equal(store.rows.length, 1);
  assert.equal(store.rows[0].unitId, null);
  assert.equal(store.rows[0].source, "provider");
  assert.equal(store.counts.update, 0, "same payload must not write again");

  const revised = [{ ...parsed[0], name: "Tahun Baru Nasional (Revisi)" }];
  assert.deepEqual(await syncNationalHolidays(store, revised), { created: 0, updated: 1, unchanged: 0, conflicts: 0, total: 1 });
  assert.equal(store.rows[0].name, revised[0].name);
  const legacy = memoryStore([{ id: "legacy", unitId: null, date: new Date("2026-01-01T00:00:00Z"), name: "Hari Libur Lama", description: null, source: "legacy", providerKey: null, providerSyncedAt: null }]);
  assert.equal((await syncNationalHolidays(legacy, parsed)).conflicts, 1);
  assert.equal(legacy.rows[0].name, "Hari Libur Lama", "must not overwrite existing non-provider holidays");
  assert.throws(() => parseApiIndonesiaHolidays({ data: [{ ...fixture.data[0], date: "2025-01-01", year: 2025 }] }, 2026), /tahun/i);
  assert.throws(() => parseApiIndonesiaHolidays({ data: [{ ...fixture.data[0], date: "2026-02-31" }] }, 2026), /tidak valid/i);
  assert.throws(() => parseApiIndonesiaHolidays({ data: [fixture.data[0], fixture.data[0]] }, 2026), /duplikat/i);
  assert.deepEqual(parseApiIndonesiaHolidays({ data: [fixture.data[1], fixture.data[2]] }, 2026), []);
  let requestedUrl = "";
  let requestedKey = "";
  assert.deepEqual(await fetchApiIndonesiaHolidays(2026, { apiKey: "test-only", fetchImplementation: async (input: RequestInfo | URL, init?: RequestInit) => {
    requestedUrl = String(input);
    requestedKey = new Headers(init?.headers).get("x-api-key") || "";
    return new Response(JSON.stringify(fixture), { status: 200 });
  } }), parsed);
  assert.equal(requestedUrl, "https://use.apiindonesia.id/api/v1/libur?tahun=2026");
  assert.equal(requestedKey, "test-only");
  await assert.rejects(() => fetchApiIndonesiaHolidays(2026, { apiKey: "test-only", fetchImplementation: async () => new Response("down", { status: 503 }) }), /503/);
  assert.equal(store.rows.length, 1, "provider fetch failure must not mutate previous effective holidays");
  console.log("national holiday sync passed");
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
