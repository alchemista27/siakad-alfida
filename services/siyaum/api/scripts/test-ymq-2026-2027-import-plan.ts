import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildYmqImportPlan, type ResolvedRosterRow } from "./ymq-2026-2027-import/plan";
import { reconcileYmqWorkbookRows } from "./ymq-2026-2027-import/reconcile";

const schema = readFileSync(resolve(import.meta.dirname, "../prisma/schema.prisma"), "utf8");
assert.match(schema, /enum\s+YmqProgressLevel\s+\{[\s\S]*pra_tahsin[\s\S]*tahsin[\s\S]*tahfiz[\s\S]*\}/);
assert.match(schema, /sourceKey\s+String\?\s+@unique\s+@map\("source_key"\)/);
assert.match(schema, /progressLevel\s+YmqProgressLevel\?\s+@map\("progress_level"\)/);

const rows: ResolvedRosterRow[] = [
  {
    rowNumber: 5,
    pembina: { id: "11111111-1111-4111-8111-111111111111", fullName: "Badriah" },
    unit: { id: "22222222-2222-4222-8222-222222222222", name: "SD Islam Terpadu Iqra 1" },
    participant: { id: "33333333-3333-4333-8333-333333333333", fullName: "Peserta Satu" },
    progressLevel: "pra_tahsin",
  },
  {
    rowNumber: 6,
    pembina: { id: "11111111-1111-4111-8111-111111111111", fullName: "Badriah" },
    unit: { id: "22222222-2222-4222-8222-222222222222", name: "SD Islam Terpadu Iqra 1" },
    participant: { id: "44444444-4444-4444-8444-444444444444", fullName: "Peserta Dua" },
    progressLevel: "tahsin",
  },
  {
    rowNumber: 7,
    pembina: { id: "11111111-1111-4111-8111-111111111111", fullName: "Badriah" },
    unit: { id: "55555555-5555-4555-8555-555555555555", name: "LAZIS Alfida" },
    participant: { id: "66666666-6666-4666-8666-666666666666", fullName: "Peserta Tiga" },
    progressLevel: "tahfiz",
  },
];

const plan = buildYmqImportPlan(rows);
assert.equal(plan.groups.length, 2);
assert.equal(plan.groups[0].sourceKey, "ymq-2026-2027:11111111-1111-4111-8111-111111111111:22222222-2222-4222-8222-222222222222");
assert.equal(plan.groups[0].name, "Badriah — SD Islam Terpadu Iqra 1");
assert.equal(plan.groups[0].members.length, 2);
assert.deepEqual(plan.groups[0].members.map((member) => member.progressLevel), ["pra_tahsin", "tahsin"]);
assert.equal(plan.groups[1].members[0].progressLevel, "tahfiz");
assert.deepEqual(plan.blockingIssues, []);

const duplicate = buildYmqImportPlan([...rows, { ...rows[0], rowNumber: 8, unit: { id: "77777777-7777-4777-8777-777777777777", name: "LKSA Asrama Yatim Alfida" } }]);
assert.equal(duplicate.blockingIssues.length, 1);
assert.match(duplicate.blockingIssues[0].message, /dua penempatan aktif/i);

const aggregation = reconcileYmqWorkbookRows([
  { rowNumber: 5, pembinaName: "Pembina Sama", unitLabel: "Yayasan", participantName: "Peserta Satu", progressLevel: "tahsin" },
  { rowNumber: 6, pembinaName: "Pembina Sama", unitLabel: "Yayasan", participantName: "Peserta Dua", progressLevel: "tahsin" },
  { rowNumber: 7, pembinaName: "Pembina Lain", unitLabel: "Yayasan", participantName: "Peserta Satu", progressLevel: "tahsin" },
], [], [{ id: "99999999-9999-4999-8999-999999999999", name: "Kantor Pusat Yayasan" }]);
assert.deepEqual(aggregation.summary.unresolved, {
  pembina: { occurrences: 3, uniqueNames: 2 },
  participant: { occurrences: 3, uniqueNames: 2 },
});
assert.deepEqual(aggregation.identityIssues.map((issue) => [issue.field, issue.displayName, issue.rowNumbers]), [
  ["pembina", "Pembina Lain", [7]],
  ["pembina", "Pembina Sama", [5, 6]],
  ["participant", "Peserta Dua", [6]],
  ["participant", "Peserta Satu", [5, 7]],
]);

console.log("YMQ import group identity and participant progress contract passed");
