import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { PrismaClient } from "../src/generated/prisma";
import { applyYmqImport } from "./ymq-2026-2027-import/apply";
import { buildYmqAccountPlan, type AccountPlanRosterRow } from "./ymq-2026-2027-import/account-plan";
import { AuthRosterBrokerClient } from "./ymq-2026-2027-import/auth-roster-broker";
import { normalizeYmqName } from "./ymq-2026-2027-import/aliases";
import { reconcileYmqWorkbookRows, type UnitIssue } from "./ymq-2026-2027-import/reconcile";
import { resolveCanonicalUnitName } from "./ymq-2026-2027-import/unit-map";
import { fetchActiveSimpegUnits } from "./ymq-2026-2027-import/units";
import { readYmqWorkbook } from "./ymq-2026-2027-import/workbook";

type Options = { input: string; report: string; mode: "dry-run" | "apply"; actorUserId: string };

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const [rows, units] = await Promise.all([readYmqWorkbook(options.input), fetchActiveSimpegUnits()]);
  const { accountRows, unitIssues } = resolveAccountRows(rows, units);
  const accountPlan = buildYmqAccountPlan(accountRows);
  const preflightIssues = [...unitIssues, ...accountPlan.blockingIssues];
  const baseReport = {
    generatedAt: new Date().toISOString(),
    mode: options.mode,
    source: {
      rows: rows.length,
      uniquePembina: new Set(rows.map((row) => normalizeYmqName(row.pembinaName))).size,
      uniqueParticipants: new Set(rows.map((row) => normalizeYmqName(row.participantName))).size,
    },
    accountProvisioning: { planned: accountPlan.accounts.length, created: 0, existing: 0, roleGrants: 0, conflicts: 0 },
    reconciliation: { unitRowIssues: unitIssues.length, accountPlanIssues: accountPlan.blockingIssues.length, identityIssues: 0, membershipConflicts: 0 },
    summary: {
      groups: countGroups(accountRows),
      units: new Set(accountRows.map((row) => row.unit.id)).size,
      pembina: new Set(accountRows.map((row) => normalizeYmqName(row.pembinaName))).size,
      participants: new Set(accountRows.map((row) => normalizeYmqName(row.participantName))).size,
      blockingIssues: preflightIssues.length,
    },
    unitIssues,
    accountPlanIssues: accountPlan.blockingIssues,
  };

  if (preflightIssues.length) return finish(options, baseReport, 2, `YMQ import blocked: ${preflightIssues.length} issue(s). Review ${options.report}`);

  const broker = new AuthRosterBrokerClient();
  const request = { actorUserId: options.actorUserId, rosterVersion: "ymq-2026-2027" as const, accounts: accountPlan.accounts };
  if (options.mode === "dry-run") {
    const preview = await broker.preview(request);
    const conflicts = preview.accounts.filter((account) => account.conflicts.length > 0 || account.status === "existing-email-conflict");
    const report = {
      ...baseReport,
      accountProvisioning: {
        ...baseReport.accountProvisioning,
        created: preview.accounts.filter((account) => account.status === "created").length,
        existing: preview.accounts.filter((account) => account.status === "existing").length,
        conflicts: conflicts.length,
      },
      preview: preview.accounts,
      summary: { ...baseReport.summary, blockingIssues: conflicts.length },
    };
    return finish(options, report, conflicts.length ? 2 : 0, conflicts.length
      ? `YMQ import blocked: ${conflicts.length} account conflict(s). Review ${options.report}`
      : `YMQ import dry-run ready: ${report.source.rows} rows, ${report.summary.groups} groups, ${report.summary.participants} participants.`);
  }

  const provisioned = await broker.provision(request);
  const reconciliation = reconcileYmqWorkbookRows(rows, provisioned.accounts, units);
  const blockers = [...reconciliation.identityIssues, ...reconciliation.unitIssues, ...reconciliation.plan.blockingIssues];
  const report = {
    ...baseReport,
    reconciliation: {
      unitRowIssues: reconciliation.unitIssues.length,
      accountPlanIssues: accountPlan.blockingIssues.length,
      identityIssues: reconciliation.identityIssues.length,
      membershipConflicts: reconciliation.plan.blockingIssues.length,
    },
    summary: {
      groups: reconciliation.plan.groups.length,
      units: new Set(reconciliation.plan.groups.map((group) => group.unit.id)).size,
      pembina: new Set(reconciliation.plan.groups.map((group) => group.pembina.id)).size,
      participants: new Set(reconciliation.plan.groups.flatMap((group) => group.members.map((member) => member.id))).size,
      blockingIssues: blockers.length,
    },
    identityIssues: reconciliation.identityIssues,
    membershipConflicts: reconciliation.plan.blockingIssues,
  };
  if (blockers.length) return finish(options, report, 2, `YMQ import blocked after Auth provisioning: ${blockers.length} issue(s). Review ${options.report}`);

  const prisma = new PrismaClient();
  try {
    const applied = await applyYmqImport(prisma, reconciliation.plan, provisioned.accounts, accountPlan.accounts);
    const result = {
      ...report,
      accountProvisioning: {
        ...report.accountProvisioning,
        created: provisioned.accounts.length,
      },
      siyaumProjection: applied.projectionSync,
    };
    return finish(options, result, 0, `YMQ import applied: ${applied.groups} groups, ${applied.members} memberships; ${applied.projectionSync.created + applied.projectionSync.updated} projection users synchronized.`);
  } finally {
    await prisma.$disconnect();
  }
}

function resolveAccountRows(rows: Awaited<ReturnType<typeof readYmqWorkbook>>, units: Array<{ id: string; name: string }>): { accountRows: AccountPlanRosterRow[]; unitIssues: UnitIssue[] } {
  const unitsByName = new Map(units.map((unit) => [normalizeYmqName(unit.name), unit]));
  const accountRows: AccountPlanRosterRow[] = [];
  const unitIssues: UnitIssue[] = [];
  for (const row of rows) {
    const canonicalName = resolveCanonicalUnitName(row.unitLabel);
    const unit = canonicalName ? unitsByName.get(normalizeYmqName(canonicalName)) : undefined;
    if (!unit) {
      unitIssues.push({ kind: "unknown-unit", rowNumber: row.rowNumber, field: "unit", value: row.unitLabel, message: `Unit pada baris ${row.rowNumber} tidak dapat dipetakan ke katalog unit aktif: ${row.unitLabel}.` });
      continue;
    }
    accountRows.push({ ...row, unit });
  }
  return { accountRows, unitIssues };
}

function countGroups(rows: AccountPlanRosterRow[]) {
  return new Set(rows.map((row) => `${normalizeYmqName(row.pembinaName)}\u0000${row.unit.id}`)).size;
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
  if (!input || !report || !mode || !isUuid(actorUserId)) throw new Error("Gunakan --input <workbook> --report <json> --actor-user-id <UUID Super Admin> dan salah satu --dry-run atau --apply.");
  return { input: resolve(input), report: resolve(report), mode, actorUserId };
}

function isUuid(value: string | undefined): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "YMQ import gagal.");
  process.exitCode = 1;
});
