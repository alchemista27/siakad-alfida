import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { normalizeYmqName } from "./ymq-2026-2027-import/aliases";
import {
  buildYmqAccountPlan,
  createAlfidaEmail,
  type AccountPlanRosterRow,
} from "./ymq-2026-2027-import/account-plan";

const unitA = { id: "unit-a", name: "Unit A" };
const unitB = { id: "unit-b", name: "Unit B" };

function row(
  rowNumber: number,
  pembinaName: string,
  participantName: string,
  unit = unitA,
): AccountPlanRosterRow {
  return {
    rowNumber,
    pembinaName,
    participantName,
    unitLabel: unit.name,
    unit,
    progressLevel: "tahsin",
  };
}

async function main() {
  assert.equal(createAlfidaEmail("Abdul Rahmat"), "abdul.rahmat@alfida.or.id");
  assert.equal(createAlfidaEmail("Ahmad Baihaqi Manulang, M.Pd."), "ahmad.manulang@alfida.or.id");
  assert.equal(createAlfidaEmail("Eka Lusianti, S.Pd.Gr."), "eka.lusianti@alfida.or.id");
  assert.equal(normalizeYmqName("Ardiansyah, S.Pd.Gr."), "ardiansyah", "trailing academic credentials must not create a second roster identity");
  assert.equal(normalizeYmqName("Ardiansyah S.Pd."), "ardiansyah");
  assert.equal(createAlfidaEmail("Sutrisno"), "sutrisno@alfida.or.id");

  const pembinaPlan = buildYmqAccountPlan([
    row(5, "Abdul Rahmat", "Peserta Satu", unitA),
    row(6, "Abdul Rahmat", "Peserta Dua", unitB),
  ]);
  const abdul = pembinaPlan.accounts.find((account) => account.normalizedName === "abdul rahmat");
  assert.ok(abdul);
  assert.equal(abdul.email, "abdul.rahmat@alfida.or.id");
  assert.deepEqual(abdul.assignments, [
    { app: "simpeg", role: "pegawai", unitId: "unit-a" },
    { app: "simpeg", role: "pegawai", unitId: "unit-b" },
    { app: "siyaum", role: "pembina_ymq", unitId: null },
    { app: "siyaum", role: "peserta", unitId: null },
  ]);
  assert.equal(pembinaPlan.groupAssignments.length, 2);
  assert.deepEqual(pembinaPlan.blockingIssues, []);

  const pqaPembinaPlan = buildYmqAccountPlan([
    row(5, "Badriah, S.Pd.", "Peserta Satu", unitA),
    row(6, "Badriah, S.Pd.", "Peserta Dua", unitB),
  ]);
  const badriah = pqaPembinaPlan.accounts.find((account) => account.email === "badriah@alfida.or.id");
  assert.ok(badriah);
  assert.deepEqual(badriah.assignments, [
    { app: "simpeg", role: "pegawai", unitId: "18d0d36c-aea5-4ba6-a89b-320f9a4f240d" },
    { app: "siyaum", role: "pembina_ymq", unitId: null },
    { app: "siyaum", role: "peserta", unitId: null },
  ], "PQA pembina must have one canonical SIMPEG placement at Pesantren Quran Alfida");

  const collisionPlan = buildYmqAccountPlan([
    row(5, "Pembina Satu", "Abdul Rahmat"),
    row(6, "Pembina Dua", "Abdul A Rahmat"),
  ]);
  assert.deepEqual(collisionPlan.blockingIssues, [{
    kind: "email-collision",
    email: "abdul.rahmat@alfida.or.id",
    names: ["abdul a rahmat", "abdul rahmat"],
    rowNumbers: [5, 6],
  }]);

  const sharedIdentityPlan = buildYmqAccountPlan([
    row(5, "Pembina Lain", "Aisyah", unitA),
    row(6, "Aisyah", "Peserta Lain", unitA),
  ]);
  const aisyah = sharedIdentityPlan.accounts.find((account) => account.normalizedName === "aisyah");
  assert.ok(aisyah);
  assert.deepEqual(aisyah.assignments, [
    { app: "simpeg", role: "pegawai", unitId: "unit-a" },
    { app: "siyaum", role: "pembina_ymq", unitId: null },
    { app: "siyaum", role: "peserta", unitId: null },
  ]);

  const specialPlan = buildYmqAccountPlan([row(5, "Sutrisno", "Peserta Lain", unitA)]);
  const admin = specialPlan.accounts.find((account) => account.email === "admin.siyaum@alfida.or.id");
  const sutrisno = specialPlan.accounts.find((account) => account.email === "sutrisno@alfida.or.id");
  assert.ok(admin);
  assert.ok(sutrisno);
  assert.deepEqual(admin.assignments, [{ app: "siyaum", role: "admin_ymq", unitId: null }]);
  assert.deepEqual(sutrisno.assignments, [
    { app: "simpeg", role: "pimpinan", unitId: null },
    { app: "siyaum", role: "pembina_ymq", unitId: null },
    { app: "siyaum", role: "peserta", unitId: null },
  ]);

  const repeatedSameGroupPlan = buildYmqAccountPlan([
    row(5, "Pembina Sama", "Peserta Sama", unitA),
    row(6, "Pembina Sama", "Peserta Sama", unitA),
  ]);
  assert.deepEqual(repeatedSameGroupPlan.blockingIssues, [], "repeated rows inside one placement are not a cross-group conflict");

  const duplicatePlan = buildYmqAccountPlan([
    row(5, "Pembina Satu", "Peserta Ganda", unitA),
    row(6, "Pembina Dua", "Peserta Ganda", unitB),
  ]);
  assert.deepEqual(duplicatePlan.blockingIssues, [{
    kind: "duplicate-active-membership",
    normalizedName: "peserta ganda",
    rowNumbers: [5, 6],
  }]);

  const plannerSource = await readFile(resolve(import.meta.dirname, "ymq-2026-2027-import/account-plan.ts"), "utf8");
  assert.doesNotMatch(plannerSource, /\bPrisma\b|\bfetch\b|\bprocess\.env\b/);

  console.log("YMQ account plan contract passed");
}

void main().catch((error: unknown) => {
  throw error;
});
