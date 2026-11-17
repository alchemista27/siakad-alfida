import assert from "node:assert/strict";
import { applyYmqExaminerImport, buildYmqExaminerApplyPlan } from "./ymq-2026-2027-import/examiner-apply";

const ids = {
  examinerA: "11111111-1111-4111-8111-111111111111",
  examinerB: "22222222-2222-4222-8222-222222222222",
  examinerC: "33333333-3333-4333-8333-333333333333",
  unit: "44444444-4444-4444-8444-444444444444",
};

const planned = [
  { rowNumber: 10, academicYear: "2026/2027", target: "pembina" as const, gender: "ikhwan" as const, unitId: null, unitName: null, levels: [], examinerUserId: ids.examinerA, examinerName: "A" },
  { rowNumber: 15, academicYear: "2026/2027", target: "peserta" as const, gender: "ikhwan" as const, unitId: ids.unit, unitName: "Unit", levels: ["pra_tahsin" as const], examinerUserId: ids.examinerA, examinerName: "A" },
  { rowNumber: 25, academicYear: "2026/2027", target: "peserta" as const, gender: "akhwat" as const, unitId: ids.unit, unitName: "Unit", levels: ["pra_tahsin" as const, "tahsin" as const], examinerUserId: ids.examinerC, examinerName: "C" },
];

const existing = [
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", academicYear: "2026/2027", target: "pembina" as const, gender: "ikhwan" as const, unitId: null, unitName: null, levels: [], examinerUserId: ids.examinerA },
  { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", academicYear: "2026/2027", target: "peserta" as const, gender: "ikhwan" as const, unitId: ids.unit, unitName: "Unit", levels: ["tahsin" as const], examinerUserId: ids.examinerB },
];

async function main() {
  const plan = buildYmqExaminerApplyPlan(planned, existing);
  assert.deepEqual(plan.summary, { create: 1, update: 1, unchanged: 1 });
  assert.equal(plan.operations.filter((operation) => operation.action === "update")[0].existing?.id, existing[1].id);

  const updates: unknown[] = [];
  const creates: unknown[] = [];
  const prisma = {
    $transaction: async (callback: (tx: any) => Promise<void>) => callback({
      ymqExaminerAssignment: {
        update: async (input: unknown) => { updates.push(input); },
        create: async (input: unknown) => { creates.push(input); },
      },
    }),
  };
  assert.deepEqual(await applyYmqExaminerImport(prisma as never, plan, ids.examinerC), { create: 1, update: 1, unchanged: 1 });
  assert.equal(updates.length, 1);
  assert.equal((updates[0] as any).where.id, existing[1].id);
  assert.ok((updates[0] as any).data.revokedAt instanceof Date);
  assert.equal(creates.length, 2, "one replacement after revoke and one new scope must be created");
  assert.deepEqual((creates[0] as any).data, {
    academicYear: "2026/2027",
    target: "peserta",
    gender: "ikhwan",
    unitId: ids.unit,
    unitName: "Unit",
    levels: ["pra_tahsin"],
    examinerUserId: ids.examinerA,
    assignedById: ids.examinerC,
  });

  console.log("YMQ examiner apply contract passed");
}

void main();
