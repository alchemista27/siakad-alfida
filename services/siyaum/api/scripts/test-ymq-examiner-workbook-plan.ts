import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ExcelJS from "exceljs";
import { buildYmqExaminerImportPlan, readYmqExaminerWorkbook } from "./ymq-2026-2027-import/examiners";

async function main() {
  const directory = await mkdtemp(join(tmpdir(), "ymq-examiner-workbook-"));
  const workbookPath = join(directory, "penguji.xlsx");
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Penguji");
    sheet.getRow(9).values = ["", "Group", "Unit", "Penguji"];
    sheet.getRow(10).values = ["", "Pembina YMQ", "Ikhwan", "Ust. Fulan Satu"];
    sheet.getRow(11).values = ["", "", "Akhwat", "Ustzh. Fulan Dua"];
    sheet.getCell("B13").value = "Ikhwan";
    sheet.getRow(15).values = ["", "Pra Tahsin, Tahsin, Tahfiz", "Auladuna 1", "Ust. Fulan Satu"];
    sheet.getRow(16).values = ["", "", "Auladuna 2 & SDIT Iqra' 3", "Ust. Fulan Satu"];
    sheet.getCell("B23").value = "Akhwat";
    sheet.getRow(25).values = ["", "Pra Tahsin, Tahsin, Tahfiz", "SDIT Iqra' 1", "Ustzh. Fulan Dua"];
    await workbook.xlsx.writeFile(workbookPath);

    const source = await readYmqExaminerWorkbook(workbookPath, "2026/2027");
    assert.equal(source.length, 5);
    assert.deepEqual(source[1], {
      rowNumber: 11,
      academicYear: "2026/2027",
      target: "pembina",
      gender: "akhwat",
      unitLabels: [],
      levels: [],
      examinerName: "Ustzh. Fulan Dua",
    });
    assert.deepEqual(source[3].unitLabels, ["Auladuna 2", "SDIT Iqra' 3"]);

    const plan = buildYmqExaminerImportPlan(source, [
      { id: "11111111-1111-4111-8111-111111111111", fullName: "Fulan Satu" },
      { id: "22222222-2222-4222-8222-222222222222", fullName: "Fulan Dua" },
    ], [
      { id: "33333333-3333-4333-8333-333333333333", name: "TK Islam Terpadu Auladuna 1" },
      { id: "44444444-4444-4444-8444-444444444444", name: "TK Islam Terpadu Auladuna 2" },
      { id: "55555555-5555-4555-8555-555555555555", name: "SD Islam Terpadu Iqra 3" },
      { id: "66666666-6666-4666-8666-666666666666", name: "SD Islam Terpadu Iqra 1" },
    ]);

    assert.equal(plan.sourceRows, 5);
    assert.equal(plan.assignments.length, 6, "combined unit source rows must expand into one scoped assignment per canonical unit");
    assert.deepEqual(plan.summary, { pembina: 2, pesertaIkhwan: 3, pesertaAkhwat: 1, unresolved: 0, ambiguous: 0 });
    assert.deepEqual(plan.issues, []);
    assert.equal(plan.assignments.filter((entry) => entry.target === "pembina")[0].unitId, null);

    const unresolved = buildYmqExaminerImportPlan(source, [], []);
    assert.equal(unresolved.assignments.length, 0);
    assert.equal(unresolved.summary.unresolved, 5);
    assert.ok(unresolved.issues.every((issue) => issue.kind === "unresolved-examiner" || issue.kind === "unknown-unit"));

    console.log("YMQ examiner workbook plan contract passed");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

void main();
