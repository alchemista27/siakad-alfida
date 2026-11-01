import { resolve } from "node:path";
import { normalizeYmqName } from "./ymq-2026-2027-import/aliases";
import { readYmqWorkbook, type WorkbookRosterRow } from "./ymq-2026-2027-import/workbook";

export type YmqWorkbookInspection = {
  rows: number;
  uniquePembina: number;
  uniqueParticipants: number;
  units: number;
  pembinaUnitPairs: number;
};

export async function inspectYmqWorkbook(inputPath: string): Promise<YmqWorkbookInspection> {
  return summarizeYmqWorkbookRows(await readYmqWorkbook(inputPath));
}

export function summarizeYmqWorkbookRows(rows: WorkbookRosterRow[]): YmqWorkbookInspection {
  return {
    rows: rows.length,
    uniquePembina: new Set(rows.map((row) => normalizeYmqName(row.pembinaName))).size,
    uniqueParticipants: new Set(rows.map((row) => normalizeYmqName(row.participantName))).size,
    units: new Set(rows.map((row) => normalizeYmqName(row.unitLabel))).size,
    pembinaUnitPairs: new Set(rows.map((row) => `${normalizeYmqName(row.pembinaName)}\u0000${normalizeYmqName(row.unitLabel)}`)).size,
  };
}

async function main() {
  const inputPath = parseInput(process.argv.slice(2));
  console.log(JSON.stringify(await inspectYmqWorkbook(inputPath), null, 2));
}

function parseInput(args: string[]): string {
  if (args.length !== 2 || args[0] !== "--input" || !args[1] || args[1].startsWith("--")) {
    throw new Error("Gunakan --input <workbook>.");
  }
  return resolve(args[1]);
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Inspeksi workbook YMQ gagal.");
    process.exitCode = 1;
  });
}
