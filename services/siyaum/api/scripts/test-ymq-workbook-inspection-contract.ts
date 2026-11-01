import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import ExcelJS from "exceljs";
import { inspectYmqWorkbook } from "./inspect-ymq-2026-2027-workbook";

async function main() {
  const fixtureDirectory = await mkdtemp(join(tmpdir(), "ymq-workbook-inspection-"));
  const fixturePath = join(fixtureDirectory, "roster.xlsx");

  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Kelompok");
    sheet.getRow(4).values = [
      "NO",
      "Pembina",
      "Unit",
      "Binaan",
      "Before 2025/2026",
      "After 2026/2027",
    ];
    sheet.getRow(5).values = [1, "Abdul Ramad", "Yayasan", "Peserta Satu", "", "Pra Tahsin"];
    sheet.getRow(6).values = [2, "Pembina Dua", "Yayasan", "Peserta Dua", "", "Tahsin"];
    sheet.getRow(7).values = [3, "Abdul Rahmat", "PQA", "Peserta Satu", "", "Tahfizh"];
    await workbook.xlsx.writeFile(fixturePath);

    assert.deepEqual(await inspectYmqWorkbook(fixturePath), {
      rows: 3,
      uniquePembina: 2,
      uniqueParticipants: 2,
      units: 2,
      pembinaUnitPairs: 3,
    });

    const inspectionSource = await readFile(resolve(import.meta.dirname, "inspect-ymq-2026-2027-workbook.ts"), "utf8");
    assert.match(inspectionSource, /readYmqWorkbook/);
    assert.doesNotMatch(inspectionSource, /\bPrismaClient\b|\bfetch\b|\bprocess\.env\b|\bwriteFile\b|\bmkdir\b|new\s+\w*Client\b/);

    console.log("YMQ workbook inspection contract passed");
  } finally {
    await rm(fixtureDirectory, { recursive: true, force: true });
  }
}

void main().catch((error: unknown) => {
  throw error;
});
