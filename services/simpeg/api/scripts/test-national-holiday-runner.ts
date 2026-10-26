import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(__dirname, "../src/attendance/national-holiday-runner.ts");
assert.ok(existsSync(path), "National holiday runner must exist");

async function main() {
  const { runNationalHolidaySync } = await import("../src/attendance/national-holiday-runner");
  const years: number[] = [];
  let transactions = 0;
  const one = { key: "apiindonesia:a", date: "2026-01-01", name: "Tahun Baru", kind: "national" as const };
  const two = { key: "apiindonesia:b", date: "2027-01-01", name: "Tahun Baru", kind: "national" as const };
  const result = await runNationalHolidaySync([2026, 2027], async (year) => {
    years.push(year);
    return year === 2026 ? [one] : [two];
  }, async (records) => {
    transactions++;
    assert.deepEqual(records, [one, two]);
    return { created: 2, updated: 0, unchanged: 0, conflicts: 0, total: 2 };
  });
  assert.deepEqual(years, [2026, 2027]);
  assert.equal(transactions, 1);
  assert.equal(result.created, 2);
  transactions = 0;
  await assert.rejects(() => runNationalHolidaySync([2026, 2027], async (year) => {
    if (year === 2027) throw new Error("Provider unavailable");
    return [one];
  }, async () => { transactions++; throw new Error("Should not mutate database"); }), /Provider unavailable/);
  assert.equal(transactions, 0, "fetch every year successfully before database writes");
  console.log("national holiday runner passed");
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });
