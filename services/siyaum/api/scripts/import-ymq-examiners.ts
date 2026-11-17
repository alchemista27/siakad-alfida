import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { PrismaClient } from "../src/generated/prisma";
import { applyYmqExaminerImport, buildYmqExaminerApplyPlan } from "./ymq-2026-2027-import/examiner-apply";
import { buildYmqExaminerImportPlan, readYmqExaminerWorkbook } from "./ymq-2026-2027-import/examiners";
import { fetchActiveSimpegUnits } from "./ymq-2026-2027-import/units";

type Options = { input: string; report: string; academicYear: string; mode: "dry-run" | "apply"; actorUserId: string };

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const prisma = new PrismaClient();
  try {
    const [source, directory, units, existing] = await Promise.all([
      readYmqExaminerWorkbook(options.input, options.academicYear),
      prisma.user.findMany({ where: { isActive: true }, select: { id: true, fullName: true }, orderBy: { fullName: "asc" } }),
      fetchActiveSimpegUnits(),
      prisma.ymqExaminerAssignment.findMany({
        where: { academicYear: options.academicYear, revokedAt: null },
        select: { id: true, academicYear: true, target: true, gender: true, unitId: true, unitName: true, levels: true, examinerUserId: true },
      }),
    ]);
    const reconciliation = buildYmqExaminerImportPlan(source, directory, units);
    const applyPlan = buildYmqExaminerApplyPlan(reconciliation.assignments, existing);
    const report = {
      generatedAt: new Date().toISOString(),
      mode: options.mode,
      academicYear: options.academicYear,
      source: { rows: reconciliation.sourceRows, plannedScopes: reconciliation.assignments.length },
      summary: { ...reconciliation.summary, ...applyPlan.summary },
      issues: reconciliation.issues,
      operations: applyPlan.operations.map((operation) => ({
        action: operation.action,
        rowNumber: operation.planned.rowNumber,
        target: operation.planned.target,
        gender: operation.planned.gender,
        unitName: operation.planned.unitName,
        levels: operation.planned.levels,
        examinerName: operation.planned.examinerName,
      })),
    };
    if (reconciliation.issues.length) return finish(options, report, 2, `Import penguji diblokir: ${reconciliation.issues.length} isu rekonsiliasi. Tinjau ${options.report}`);
    if (options.mode === "dry-run") return finish(options, report, 0, `Dry-run penguji siap: ${reconciliation.sourceRows} baris sumber menjadi ${reconciliation.assignments.length} cakupan penugasan.`);

    const actor = await prisma.user.findFirst({ where: { id: options.actorUserId, isActive: true }, select: { id: true } });
    if (!actor) return finish(options, report, 2, "Import penguji diblokir: actorUserId tidak ditemukan atau tidak aktif.");
    const applied = await applyYmqExaminerImport(prisma, applyPlan, actor.id);
    return finish(options, { ...report, applied }, 0, `Import penguji diterapkan: ${applied.create} dibuat, ${applied.update} diperbarui, ${applied.unchanged} tidak berubah.`);
  } finally {
    await prisma.$disconnect();
  }
}

async function finish(options: Options, report: unknown, exitCode: number, message: string) {
  await mkdir(dirname(options.report), { recursive: true });
  await writeFile(options.report, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  if (exitCode) process.exitCode = exitCode;
  console[exitCode ? "error" : "log"](message);
}

function parseOptions(args: string[]): Options {
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (!["--input", "--report", "--academic-year", "--dry-run", "--apply", "--actor-user-id"].includes(key)) throw new Error(`Argumen tidak dikenal: ${key}`);
    if (key === "--dry-run" || key === "--apply") {
      if (values.has("mode")) throw new Error("Pilih tepat satu mode: --dry-run atau --apply.");
      values.set("mode", key === "--dry-run" ? "dry-run" : "apply");
      continue;
    }
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Argumen ${key} memerlukan nilai.`);
    values.set(key.slice(2), value);
    index += 1;
  }
  const input = values.get("input");
  const report = values.get("report");
  const academicYear = values.get("academic-year");
  const mode = values.get("mode") as Options["mode"] | undefined;
  const actorUserId = values.get("actor-user-id");
  if (!input || !report || !academicYear || !mode || !isUuid(actorUserId)) {
    throw new Error("Gunakan --input <workbook> --report <json> --academic-year YYYY/YYYY --actor-user-id <UUID> dan salah satu --dry-run atau --apply.");
  }
  if (!/^\d{4}\/\d{4}$/.test(academicYear) || Number(academicYear.slice(5)) !== Number(academicYear.slice(0, 4)) + 1) {
    throw new Error("Tahun akademik harus berformat YYYY/YYYY dengan dua tahun berurutan.");
  }
  return { input: resolve(input), report: resolve(report), academicYear, mode, actorUserId };
}

function isUuid(value: string | undefined): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Import penguji gagal.");
  process.exitCode = 1;
});
