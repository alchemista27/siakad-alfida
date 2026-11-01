import { normalizeYmqName } from "./aliases";
import type { YmqProgressLevel } from "./plan";

const ROSTER_VERSION = "ymq-2026-2027";
const SUTRISNO_NORMALIZED_NAME = "sutrisno";

export type PlannedRosterAssignment =
  | { app: "simpeg"; role: "pegawai"; unitId: string }
  | { app: "simpeg"; role: "pimpinan"; unitId: null }
  | { app: "siyaum"; role: "peserta" | "pembina_ymq" | "admin_ymq"; unitId: null };

export type PlannedAuthAccount = {
  sourceKey: string;
  fullName: string;
  normalizedName: string;
  email: string;
  assignments: PlannedRosterAssignment[];
};

export type AccountPlanIssue =
  | { kind: "invalid-name"; normalizedName: string; rowNumbers: number[] }
  | { kind: "email-collision"; email: string; names: string[]; rowNumbers: number[] }
  | { kind: "duplicate-active-membership"; normalizedName: string; rowNumbers: number[] };

export type ResolvedCanonicalUnit = { id: string; name: string };

export type AccountPlanRosterRow = {
  rowNumber: number;
  pembinaName: string;
  unitLabel: string;
  participantName: string;
  progressLevel: YmqProgressLevel;
  unit: ResolvedCanonicalUnit;
};

export type PlannedGroupAssignment = {
  rowNumber: number;
  pembinaSourceKey: string;
  participantSourceKey: string;
  unitId: string;
  unitName: string;
  progressLevel: YmqProgressLevel;
};

export type YmqAccountPlan = {
  accounts: PlannedAuthAccount[];
  groupAssignments: PlannedGroupAssignment[];
  blockingIssues: AccountPlanIssue[];
};

type AccountDraft = {
  sourceKey: string;
  fullName: string;
  normalizedName: string;
  email: string;
  assignments: Map<string, PlannedRosterAssignment>;
  rowNumbers: Set<number>;
};

export function createAlfidaEmail(fullName: string): string | null {
  const tokens = fullName
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("id-ID")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return null;
  const localPart = tokens.length === 1
    ? tokens[0]
    : `${tokens[0]}.${tokens.at(-1)}`;
  return `${localPart}@alfida.or.id`;
}

export function buildYmqAccountPlan(rows: AccountPlanRosterRow[]): YmqAccountPlan {
  const accountsByName = new Map<string, AccountDraft>();
  const invalidRowsByName = new Map<string, Set<number>>();
  const participantPlacementsByName = new Map<string, { rowNumbers: Set<number>; placements: Set<string> }>();
  const validRows: Array<{ row: AccountPlanRosterRow; pembina: AccountDraft; participant: AccountDraft }> = [];

  for (const row of rows) {
    const pembina = addRosterAccount(accountsByName, invalidRowsByName, row.pembinaName, row.rowNumber, [
      { app: "simpeg", role: "pegawai", unitId: row.unit.id },
      { app: "siyaum", role: "peserta", unitId: null },
      { app: "siyaum", role: "pembina_ymq", unitId: null },
    ]);
    const participant = addRosterAccount(accountsByName, invalidRowsByName, row.participantName, row.rowNumber, [
      { app: "simpeg", role: "pegawai", unitId: row.unit.id },
      { app: "siyaum", role: "peserta", unitId: null },
    ]);

    const participantName = normalizeYmqName(row.participantName);
    if (participantName) {
      const placement = participantPlacementsByName.get(participantName) || { rowNumbers: new Set<number>(), placements: new Set<string>() };
      placement.rowNumbers.add(row.rowNumber);
      placement.placements.add(`${normalizeYmqName(row.pembinaName)}\u0000${row.unit.id}`);
      participantPlacementsByName.set(participantName, placement);
    }
    if (pembina && participant) validRows.push({ row, pembina, participant });
  }

  addSyntheticAccount(accountsByName, "Admin SIYAUM", "admin.siyaum@alfida.or.id", [
    { app: "siyaum", role: "admin_ymq", unitId: null },
  ]);
  addSyntheticAccount(accountsByName, "Sutrisno", "sutrisno@alfida.or.id", [
    { app: "simpeg", role: "pimpinan", unitId: null },
  ]);

  const accounts = [...accountsByName.values()]
    .map((account) => ({
      sourceKey: account.sourceKey,
      fullName: account.fullName,
      normalizedName: account.normalizedName,
      email: account.email,
      assignments: [...account.assignments.values()].sort(compareAssignments),
    }))
    .sort((left, right) => left.normalizedName.localeCompare(right.normalizedName, "id"));

  return {
    accounts,
    groupAssignments: validRows
      .map(({ row, pembina, participant }) => ({
        rowNumber: row.rowNumber,
        pembinaSourceKey: pembina.sourceKey,
        participantSourceKey: participant.sourceKey,
        unitId: row.unit.id,
        unitName: row.unit.name,
        progressLevel: row.progressLevel,
      }))
      .sort((left, right) => left.rowNumber - right.rowNumber),
    blockingIssues: [
      ...invalidNameIssues(invalidRowsByName),
      ...emailCollisionIssues(accountsByName),
      ...duplicateMembershipIssues(participantPlacementsByName),
    ].sort(compareIssues),
  };
}

function addRosterAccount(
  accountsByName: Map<string, AccountDraft>,
  invalidRowsByName: Map<string, Set<number>>,
  fullName: string,
  rowNumber: number,
  assignments: PlannedRosterAssignment[],
): AccountDraft | null {
  const normalizedName = normalizeYmqName(fullName);
  const email = createAlfidaEmail(normalizedName);
  if (!email) {
    const rowNumbers = invalidRowsByName.get(normalizedName) || new Set<number>();
    rowNumbers.add(rowNumber);
    invalidRowsByName.set(normalizedName, rowNumbers);
    return null;
  }

  const existing = accountsByName.get(normalizedName);
  const account = existing || {
    sourceKey: `${ROSTER_VERSION}:${normalizedName}`,
    fullName,
    normalizedName,
    email,
    assignments: new Map<string, PlannedRosterAssignment>(),
    rowNumbers: new Set<number>(),
  };
  account.rowNumbers.add(rowNumber);
  for (const assignment of assignments) {
    if (normalizedName === SUTRISNO_NORMALIZED_NAME && assignment.app === "simpeg" && assignment.role === "pegawai") continue;
    account.assignments.set(assignmentKey(assignment), assignment);
  }
  accountsByName.set(normalizedName, account);
  return account;
}

function addSyntheticAccount(
  accountsByName: Map<string, AccountDraft>,
  fullName: string,
  email: string,
  assignments: PlannedRosterAssignment[],
) {
  const normalizedName = normalizeYmqName(fullName);
  const account = accountsByName.get(normalizedName) || {
    sourceKey: `${ROSTER_VERSION}:${normalizedName}`,
    fullName,
    normalizedName,
    email,
    assignments: new Map<string, PlannedRosterAssignment>(),
    rowNumbers: new Set<number>(),
  };
  for (const assignment of assignments) account.assignments.set(assignmentKey(assignment), assignment);
  accountsByName.set(normalizedName, account);
}

function invalidNameIssues(invalidRowsByName: Map<string, Set<number>>): AccountPlanIssue[] {
  return [...invalidRowsByName.entries()].map(([normalizedName, rowNumbers]) => ({
    kind: "invalid-name",
    normalizedName,
    rowNumbers: sortedNumbers(rowNumbers),
  }));
}

function emailCollisionIssues(accountsByName: Map<string, AccountDraft>): AccountPlanIssue[] {
  const accountsByEmail = new Map<string, AccountDraft[]>();
  for (const account of accountsByName.values()) {
    accountsByEmail.set(account.email, [...(accountsByEmail.get(account.email) || []), account]);
  }
  return [...accountsByEmail.entries()]
    .filter(([, accounts]) => accounts.length > 1)
    .map(([email, accounts]) => ({
      kind: "email-collision",
      email,
      names: accounts.map((account) => account.normalizedName).sort((left, right) => left.localeCompare(right, "id")),
      rowNumbers: sortedNumbers(new Set(accounts.flatMap((account) => [...account.rowNumbers]))),
    }));
}

function duplicateMembershipIssues(placementsByName: Map<string, { rowNumbers: Set<number>; placements: Set<string> }>): AccountPlanIssue[] {
  return [...placementsByName.entries()]
    .filter(([, placement]) => placement.placements.size > 1)
    .map(([normalizedName, placement]) => ({
      kind: "duplicate-active-membership",
      normalizedName,
      rowNumbers: sortedNumbers(placement.rowNumbers),
    }));
}

function assignmentKey(assignment: PlannedRosterAssignment): string {
  return `${assignment.app}\u0000${assignment.role}\u0000${assignment.unitId || ""}`;
}

function compareAssignments(left: PlannedRosterAssignment, right: PlannedRosterAssignment): number {
  return left.app.localeCompare(right.app, "id")
    || left.role.localeCompare(right.role, "id")
    || (left.unitId || "").localeCompare(right.unitId || "id", "id");
}

function compareIssues(left: AccountPlanIssue, right: AccountPlanIssue): number {
  return left.kind.localeCompare(right.kind, "id") || issueKey(left).localeCompare(issueKey(right), "id");
}

function issueKey(issue: AccountPlanIssue): string {
  if (issue.kind === "email-collision") return issue.email;
  return issue.normalizedName;
}

function sortedNumbers(values: Set<number>): number[] {
  return [...values].sort((left, right) => left - right);
}
