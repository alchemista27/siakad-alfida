import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { PrismaClient } from "../src/generated/prisma";
import { applyYmqImport, createAuthRoleBroker } from "./ymq-2026-2027-import/apply";
import { normalizeYmqName } from "./ymq-2026-2027-import/aliases";
import { reconcileYmqWorkbookRows } from "./ymq-2026-2027-import/reconcile";
import { fetchSimpegYmqProjections } from "./ymq-2026-2027-import/projection";
import { fetchActiveSimpegUnits } from "./ymq-2026-2027-import/units";
import { readYmqWorkbook } from "./ymq-2026-2027-import/workbook";

type Options = { input: string; report: string; mode: "dry-run" | "apply"; actorUserId?: string };

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const prisma = new PrismaClient();
  try {
    const [rows, projections, units] = await Promise.all([
      readYmqWorkbook(options.input),
      fetchSimpegYmqProjections(),
      fetchActiveSimpegUnits(),
    ]);
    const reconciliation = reconcileYmqWorkbookRows(rows, projections.filter((projection) => projection.isActive).map((projection) => ({ id: projection.userId, fullName: projection.fullName })), units);
    const blockingIssues = [...reconciliation.identityIssues, ...reconciliation.unitIssues, ...reconciliation.plan.blockingIssues];
    const report = {
      generatedAt: new Date().toISOString(),
      mode: options.mode,
      source: {
        rows: rows.length,
        uniquePembina: new Set(rows.map((row) => normalizeYmqName(row.pembinaName))).size,
        uniqueParticipants: new Set(rows.map((row) => normalizeYmqName(row.participantName))).size,
      },
      reconciliation: {
        identityIssueOccurrences: reconciliation.summary.unresolved.pembina.occurrences + reconciliation.summary.unresolved.participant.occurrences,
        uniqueIdentityIssues: reconciliation.identityIssues.length,
        unresolved: reconciliation.summary.unresolved,
        unitRowIssues: reconciliation.unitIssues.length,
        membershipConflicts: reconciliation.plan.blockingIssues.length,
      },
      summary: {
        groups: reconciliation.plan.groups.length,
        units: new Set(reconciliation.plan.groups.map((group) => group.unit.id)).size,
        pembina: new Set(reconciliation.plan.groups.map((group) => group.pembina.id)).size,
        participants: new Set(reconciliation.plan.groups.flatMap((group) => group.members.map((member) => member.id))).size,
        projectionUsers: projections.length,
        blockingIssues: blockingIssues.length,
      },
      groups: reconciliation.plan.groups,
      identityIssues: reconciliation.identityIssues,
      unitIssues: reconciliation.unitIssues,
      membershipConflicts: reconciliation.plan.blockingIssues,
    };
    await mkdir(dirname(options.report), { recursive: true });
    await writeFile(options.report, `${JSON.stringify(report, null, 2)}\n`, "utf8");

    if (blockingIssues.length) {
      console.error(`YMQ import blocked: ${blockingIssues.length} issue(s). Review ${options.report}`);
      process.exitCode = 2;
      return;
    }
    if (options.mode === "dry-run") {
      console.log(`YMQ import dry-run ready: ${report.source.rows} rows, ${report.summary.groups} groups, ${report.summary.participants} participants.`);
      return;
    }

    const result = await applyYmqImport(prisma, createAuthRoleBroker(), options.actorUserId!, reconciliation.plan, projections);
    console.log(`YMQ import applied: ${result.groups} groups, ${result.members} memberships, ${result.roleGrants} new role grants; ${result.projectionSync.created + result.projectionSync.updated} projection users synchronized.`);
  } finally {
    await prisma.$disconnect();
  }
}

function parseOptions(args: string[]): Options {
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (!["--input", "--report", "--dry-run", "--apply", "--actor-user-id"].includes(key)) throw new Error(`Argumen tidak dikenal: ${key}`);
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
  const mode = values.get("mode") as Options["mode"] | undefined;
  const actorUserId = values.get("actor-user-id");
  if (!input || !report || !mode) throw new Error("Gunakan --input <workbook> --report <json> dan salah satu --dry-run atau --apply.");
  if (mode === "dry-run" && actorUserId) throw new Error("--actor-user-id hanya valid bersama --apply.");
  if (mode === "apply" && !isUuid(actorUserId)) throw new Error("--apply wajib memakai --actor-user-id UUID Admin YMQ.");
  return { input: resolve(input), report: resolve(report), mode, actorUserId };
}

function isUuid(value: string | undefined): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "YMQ import gagal.");
  process.exitCode = 1;
});
