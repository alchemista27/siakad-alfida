import assert from "node:assert/strict";
import { NATIONAL_HOLIDAYS_2026, seedNationalHolidays2026 } from "../src/attendance/national-holidays-2026";

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

async function main() {
  assert.equal(NATIONAL_HOLIDAYS_2026.length, 17, "2026 data must contain only the 17 national holidays");
  assert.ok(NATIONAL_HOLIDAYS_2026.every((holiday) => holiday.date.startsWith("2026-") && !/cuti bersama/i.test(holiday.name)), "national-holiday data must exclude cuti bersama");
  assert.deepEqual(
    NATIONAL_HOLIDAYS_2026.map((holiday) => holiday.date),
    [
      "2026-01-01", "2026-01-16", "2026-02-17", "2026-03-19", "2026-03-21", "2026-03-22", "2026-04-03", "2026-04-05", "2026-05-01", "2026-05-14", "2026-05-27", "2026-05-31", "2026-06-01", "2026-06-16", "2026-08-17", "2026-08-25", "2026-12-25",
    ],
    "national-holiday dates must match the 2026 SKB list",
  );

  const records: Array<{ id: string; unitId: null; date: Date; name: string; description: string | null }> = [];
  let creates = 0;
  let updates = 0;
  const store: any = {
    holiday: {
      async findFirst({ where }: any) {
        return records.find((record) => record.unitId === where.unitId && dateKey(record.date) === dateKey(where.date)) ?? null;
      },
      async create({ data }: any) {
        creates += 1;
        const record = { id: `holiday-${creates}`, ...data };
        records.push(record);
        return record;
      },
      async update({ where, data }: any) {
        updates += 1;
        const record = records.find((item) => item.id === where.id);
        if (!record) throw new Error("missing record");
        Object.assign(record, data);
        return record;
      },
    },
  };

  assert.deepEqual(await seedNationalHolidays2026(store), { created: 17, updated: 0, total: 17 });
  assert.deepEqual(await seedNationalHolidays2026(store), { created: 0, updated: 17, total: 17 });
  assert.equal(records.length, 17, "running the seed twice must not duplicate records");
  assert.equal(creates, 17);
  assert.equal(updates, 17);
  assert.ok(records.every((record) => record.unitId === null), "seeded holidays must be global national holidays");

  console.log("national holidays 2026 idempotency contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
