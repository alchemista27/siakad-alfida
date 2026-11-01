import ExcelJS from "exceljs";
import type { YmqProgressLevel } from "./plan";

export type WorkbookRosterRow = {
  rowNumber: number;
  pembinaName: string;
  unitLabel: string;
  participantName: string;
  progressLevel: YmqProgressLevel;
};

const expectedHeaders = ["NO", "Pembina", "Unit", "Binaan", "Before 2025/2026", "After 2026/2027"];

export async function readYmqWorkbook(inputPath: string): Promise<WorkbookRosterRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputPath);
  const sheet = workbook.getWorksheet("Kelompok");
  if (!sheet) throw new Error('Workbook harus memiliki sheet bernama "Kelompok".');

  const actualHeaders = expectedHeaders.map((_, index) => cellText(sheet.getRow(4).getCell(index + 1)));
  if (actualHeaders.some((value, index) => value !== expectedHeaders[index])) {
    throw new Error(`Header row 4 tidak sesuai: ${actualHeaders.join(" | ")}`);
  }

  const rows: WorkbookRosterRow[] = [];
  for (let rowNumber = 5; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const pembinaName = cellText(row.getCell(2));
    const unitLabel = cellText(row.getCell(3));
    const participantName = cellText(row.getCell(4));
    const rawProgress = cellText(row.getCell(6));
    if (!pembinaName && !unitLabel && !participantName && !rawProgress) continue;
    if (!pembinaName || !unitLabel || !participantName || !rawProgress) {
      throw new Error(`Baris ${rowNumber} wajib memiliki Pembina, Unit, Binaan, dan After 2026/2027.`);
    }
    rows.push({ rowNumber, pembinaName, unitLabel, participantName, progressLevel: mapProgressLevel(rawProgress, rowNumber) });
  }
  return rows;
}

function cellText(cell: ExcelJS.Cell): string {
  return cell.text.trim().replace(/\s+/g, " ");
}

function mapProgressLevel(value: string, rowNumber: number): YmqProgressLevel {
  const normalized = value.toLocaleLowerCase("id-ID").replace(/\s+/g, " ").trim();
  if (normalized === "pra tahsin") return "pra_tahsin";
  if (normalized === "tahsin") return "tahsin";
  if (normalized === "tahfizh" || normalized === "tahfiz") return "tahfiz";
  throw new Error(`Progress YMQ pada baris ${rowNumber} tidak dikenali: ${value}`);
}
