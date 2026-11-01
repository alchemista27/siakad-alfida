import { normalizeYmqName } from "./aliases";
import { buildYmqImportPlan, type ResolvedRosterRow, type YmqImportPlan } from "./plan";
import { resolveCanonicalUnitName } from "./unit-map";
import type { WorkbookRosterRow } from "./workbook";

export type DirectoryUser = { id: string; fullName: string };
export type ActiveUnit = { id: string; name: string };
type IdentityField = "pembina" | "participant";

export type IdentityIssue = {
  kind: "unknown-user" | "ambiguous-user";
  field: IdentityField;
  normalizedName: string;
  displayName: string;
  rowNumbers: number[];
  occurrences: number;
  candidateCount: number;
};

export type UnitIssue = {
  kind: "unknown-unit";
  rowNumber: number;
  field: "unit";
  value: string;
  message: string;
};

export type ReconciliationResult = {
  resolvedRows: ResolvedRosterRow[];
  identityIssues: IdentityIssue[];
  unitIssues: UnitIssue[];
  summary: {
    unresolved: Record<IdentityField, { occurrences: number; uniqueNames: number }>;
  };
  plan: YmqImportPlan;
};

export function reconcileYmqWorkbookRows(
  rows: WorkbookRosterRow[],
  users: DirectoryUser[],
  units: ActiveUnit[],
): ReconciliationResult {
  const usersByName = new Map<string, DirectoryUser[]>();
  for (const user of users) {
    const key = normalizeYmqName(user.fullName);
    usersByName.set(key, [...(usersByName.get(key) || []), user]);
  }
  const unitsByName = new Map(units.map((unit) => [normalizeYmqName(unit.name), unit]));
  const resolvedRows: ResolvedRosterRow[] = [];
  const unitIssues: UnitIssue[] = [];
  const identityIssuesByKey = new Map<string, IdentityIssue>();

  for (const row of rows) {
    const unitName = resolveCanonicalUnitName(row.unitLabel);
    const unit = unitName ? unitsByName.get(normalizeYmqName(unitName)) : undefined;
    if (!unit) {
      unitIssues.push({
        kind: "unknown-unit",
        rowNumber: row.rowNumber,
        field: "unit",
        value: row.unitLabel,
        message: `Unit pada baris ${row.rowNumber} tidak dapat dipetakan ke katalog unit aktif: ${row.unitLabel}.`,
      });
    }

    const pembina = resolveSingleUser(usersByName.get(normalizeYmqName(row.pembinaName)) || [], row.rowNumber, "pembina", row.pembinaName, identityIssuesByKey);
    const participant = resolveSingleUser(usersByName.get(normalizeYmqName(row.participantName)) || [], row.rowNumber, "participant", row.participantName, identityIssuesByKey);
    if (!unit || !pembina || !participant) continue;

    resolvedRows.push({
      rowNumber: row.rowNumber,
      pembina,
      unit,
      participant,
      progressLevel: row.progressLevel,
    });
  }

  const identityIssues = [...identityIssuesByKey.values()].sort((left, right) => {
    const field = fieldOrder(left.field) - fieldOrder(right.field);
    return field || left.normalizedName.localeCompare(right.normalizedName, "id");
  });
  const summary = {
    unresolved: {
      pembina: summarize(identityIssues, "pembina"),
      participant: summarize(identityIssues, "participant"),
    },
  };
  return { resolvedRows, identityIssues, unitIssues, summary, plan: buildYmqImportPlan(resolvedRows) };
}

function resolveSingleUser(
  matches: DirectoryUser[],
  rowNumber: number,
  field: IdentityField,
  value: string,
  issuesByKey: Map<string, IdentityIssue>,
): DirectoryUser | null {
  if (matches.length === 1) return matches[0];
  const normalizedName = normalizeYmqName(value);
  const key = `${field}:${normalizedName}`;
  const issue = issuesByKey.get(key) || {
    kind: matches.length ? "ambiguous-user" : "unknown-user",
    field,
    normalizedName,
    displayName: value,
    rowNumbers: [],
    occurrences: 0,
    candidateCount: matches.length,
  };
  issue.rowNumbers.push(rowNumber);
  issue.occurrences += 1;
  issuesByKey.set(key, issue);
  return null;
}

function fieldOrder(field: IdentityField): number {
  return field === "pembina" ? 0 : 1;
}

function summarize(issues: IdentityIssue[], field: IdentityField) {
  const filtered = issues.filter((issue) => issue.field === field);
  return {
    occurrences: filtered.reduce((total, issue) => total + issue.occurrences, 0),
    uniqueNames: filtered.length,
  };
}
