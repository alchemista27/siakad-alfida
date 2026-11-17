import ExcelJS from "exceljs";
import { normalizeYmqName } from "./aliases";
import { resolveCanonicalUnitName } from "./unit-map";

export type ExaminerTarget = "pembina" | "peserta";
export type ExaminerGender = "ikhwan" | "akhwat";
export type ExaminerLevel = "pra_tahsin" | "tahsin" | "tahfiz";

export type WorkbookExaminerAssignment = {
  rowNumber: number;
  academicYear: string;
  target: ExaminerTarget;
  gender: ExaminerGender;
  unitLabels: string[];
  levels: ExaminerLevel[];
  examinerName: string;
};

export type ExaminerDirectoryUser = { id: string; fullName: string };
export type ExaminerActiveUnit = { id: string; name: string };
export type ExaminerImportIssue = {
  kind: "unresolved-examiner" | "ambiguous-examiner" | "unknown-unit" | "duplicate-scope";
  rowNumber: number;
  value: string;
  message: string;
};
export type PlannedExaminerAssignment = {
  rowNumber: number;
  academicYear: string;
  target: ExaminerTarget;
  gender: ExaminerGender;
  unitId: string | null;
  unitName: string | null;
  levels: ExaminerLevel[];
  examinerUserId: string;
  examinerName: string;
};

const allLevels: readonly ExaminerLevel[] = ["pra_tahsin", "tahsin", "tahfiz"];

export async function readYmqExaminerWorkbook(inputPath: string, academicYear: string): Promise<WorkbookExaminerAssignment[]> {
  assertAcademicYear(academicYear);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputPath);
  const sheet = workbook.getWorksheet("Penguji");
  if (!sheet) throw new Error("Sheet Penguji tidak ditemukan.");

  const assignments: WorkbookExaminerAssignment[] = [];
  let currentGender: ExaminerGender | null = null;
  let currentLevels: ExaminerLevel[] = [];
  let previousTarget: ExaminerTarget | null = null;
  for (let rowNumber = 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const group = cellText(row.getCell(2));
    const unitOrGender = cellText(row.getCell(3));
    const examinerName = cellText(row.getCell(4));
    const standaloneGender = parseGender(group);
    if (standaloneGender && !examinerName) {
      currentGender = standaloneGender;
      continue;
    }
    if (!examinerName) continue;
    if (isHeaderRow(group, unitOrGender, examinerName)) continue;

    if (normalizeYmqName(group) === "pembina ymq") {
      const gender = parseGender(unitOrGender);
      if (!gender) throw new Error(`Gender penguji pembina tidak valid pada baris ${rowNumber}.`);
      assignments.push({ rowNumber, academicYear, target: "pembina", gender, unitLabels: [], levels: [], examinerName });
      previousTarget = "pembina";
      continue;
    }

    const inlinePembinaGender = parseGender(unitOrGender);
    if (!group && previousTarget === "pembina" && inlinePembinaGender) {
      assignments.push({ rowNumber, academicYear, target: "pembina", gender: inlinePembinaGender, unitLabels: [], levels: [], examinerName });
      continue;
    }

    previousTarget = "peserta";
    if (group) currentLevels = parseLevels(group, rowNumber);
    if (!currentGender) throw new Error(`Gender penguji peserta belum ditentukan sebelum baris ${rowNumber}.`);
    if (!currentLevels.length) throw new Error(`Level penguji peserta belum ditentukan pada baris ${rowNumber}.`);
    const unitLabels = splitUnitLabels(unitOrGender);
    if (!unitLabels.length) throw new Error(`Unit penguji peserta tidak valid pada baris ${rowNumber}.`);
    assignments.push({ rowNumber, academicYear, target: "peserta", gender: currentGender, unitLabels, levels: currentLevels, examinerName });
  }
  return assignments;
}

export function buildYmqExaminerImportPlan(
  source: WorkbookExaminerAssignment[],
  directory: ExaminerDirectoryUser[],
  units: ExaminerActiveUnit[],
) {
  const usersByName = new Map<string, ExaminerDirectoryUser[]>();
  directory.forEach((user) => {
    const key = normalizeExaminerName(user.fullName);
    usersByName.set(key, [...(usersByName.get(key) || []), user]);
  });
  const unitsByName = new Map(units.map((unit) => [normalizeYmqName(unit.name), unit]));
  const assignments: PlannedExaminerAssignment[] = [];
  const issues: ExaminerImportIssue[] = [];
  const scopes = new Set<string>();

  for (const row of source) {
    const candidates = usersByName.get(normalizeExaminerName(row.examinerName)) || [];
    if (candidates.length !== 1) {
      issues.push({
        kind: candidates.length ? "ambiguous-examiner" : "unresolved-examiner",
        rowNumber: row.rowNumber,
        value: row.examinerName,
        message: candidates.length
          ? `Penguji pada baris ${row.rowNumber} memiliki lebih dari satu kecocokan aktif: ${row.examinerName}.`
          : `Penguji pada baris ${row.rowNumber} tidak ditemukan pada direktori aktif: ${row.examinerName}.`,
      });
      continue;
    }
    const targetUnits = row.target === "pembina" ? [null] : row.unitLabels;
    for (const unitLabel of targetUnits) {
      const resolved = unitLabel === null ? null : resolveUnit(unitLabel, unitsByName);
      if (unitLabel !== null && !resolved) {
        issues.push({ kind: "unknown-unit", rowNumber: row.rowNumber, value: unitLabel, message: `Unit pada baris ${row.rowNumber} tidak dapat dipetakan: ${unitLabel}.` });
        continue;
      }
      const scope = `${row.academicYear}\u0000${row.target}\u0000${row.gender}\u0000${resolved?.id || "-"}`;
      if (scopes.has(scope)) {
        issues.push({ kind: "duplicate-scope", rowNumber: row.rowNumber, value: unitLabel || row.target, message: `Cakupan penguji duplikat pada baris ${row.rowNumber}.` });
        continue;
      }
      scopes.add(scope);
      assignments.push({
        rowNumber: row.rowNumber,
        academicYear: row.academicYear,
        target: row.target,
        gender: row.gender,
        unitId: resolved?.id || null,
        unitName: resolved?.name || null,
        levels: row.levels,
        examinerUserId: candidates[0].id,
        examinerName: candidates[0].fullName,
      });
    }
  }

  return {
    sourceRows: source.length,
    assignments,
    issues: issues.sort((left, right) => left.rowNumber - right.rowNumber || left.kind.localeCompare(right.kind, "id")),
    summary: {
      pembina: assignments.filter((assignment) => assignment.target === "pembina").length,
      pesertaIkhwan: assignments.filter((assignment) => assignment.target === "peserta" && assignment.gender === "ikhwan").length,
      pesertaAkhwat: assignments.filter((assignment) => assignment.target === "peserta" && assignment.gender === "akhwat").length,
      unresolved: issues.filter((issue) => issue.kind === "unresolved-examiner" || issue.kind === "unknown-unit").length,
      ambiguous: issues.filter((issue) => issue.kind === "ambiguous-examiner" || issue.kind === "duplicate-scope").length,
    },
  };
}

function cellText(cell: ExcelJS.Cell): string {
  return String(cell.text || "").trim();
}

function isHeaderRow(group: string, unitOrGender: string, examinerName: string): boolean {
  return normalizeYmqName(group) === "group"
    && normalizeYmqName(unitOrGender) === "unit"
    && normalizeYmqName(examinerName) === "penguji";
}

function parseGender(value: string): ExaminerGender | null {
  const normalized = normalizeYmqName(value);
  if (normalized === "ikhwan") return "ikhwan";
  if (normalized === "akhwat") return "akhwat";
  return null;
}

function parseLevels(value: string, rowNumber: number): ExaminerLevel[] {
  const normalized = normalizeYmqName(value);
  const levels = allLevels.filter((level) => normalized.includes(level.replace("_", " ")));
  if (!levels.length || levels.length !== value.split(",").filter(Boolean).length) {
    throw new Error(`Level penguji tidak valid pada baris ${rowNumber}: ${value}.`);
  }
  return levels;
}

function splitUnitLabels(value: string): string[] {
  return value.split(/\s*&\s*/).map((item) => item.trim()).filter(Boolean);
}

function resolveUnit(label: string, unitsByName: Map<string, ExaminerActiveUnit>): ExaminerActiveUnit | undefined {
  const normalized = normalizeYmqName(label);
  const canonical = resolveCanonicalUnitName(label)
    || (normalized.includes("lksa") ? "LKSA Asrama Yatim Alfida" : null);
  return unitsByName.get(normalizeYmqName(canonical || label));
}

function normalizeExaminerName(value: string): string {
  return normalizeYmqName(value).replace(/^(ust|ustzh|ustadz|ustadzah)\s+/, "");
}

function assertAcademicYear(value: string) {
  if (!/^\d{4}\/\d{4}$/.test(value)) throw new Error("Tahun akademik harus berformat YYYY/YYYY.");
  const [start, end] = value.split("/").map(Number);
  if (end !== start + 1) throw new Error("Tahun akademik harus terdiri dari dua tahun berurutan.");
}
