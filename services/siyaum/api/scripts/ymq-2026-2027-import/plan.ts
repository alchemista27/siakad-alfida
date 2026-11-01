export type YmqProgressLevel = "pra_tahsin" | "tahsin" | "tahfiz";

export type ResolvedRosterRow = {
  rowNumber: number;
  pembina: { id: string; fullName: string };
  unit: { id: string; name: string };
  participant: { id: string; fullName: string };
  progressLevel: YmqProgressLevel;
};

export type ImportBlockingIssue = {
  kind: "duplicate-active-membership";
  message: string;
  rowNumbers: number[];
  participant: { id: string; fullName: string };
};

export type PlannedMember = ResolvedRosterRow["participant"] & {
  rowNumber: number;
  progressLevel: YmqProgressLevel;
};

export type PlannedGroup = {
  sourceKey: string;
  name: string;
  pembina: ResolvedRosterRow["pembina"];
  unit: ResolvedRosterRow["unit"];
  members: PlannedMember[];
  progressCounts: Record<YmqProgressLevel, number>;
};

export type YmqImportPlan = {
  groups: PlannedGroup[];
  blockingIssues: ImportBlockingIssue[];
};

const PERIOD = "ymq-2026-2027";

export function buildYmqImportPlan(rows: ResolvedRosterRow[]): YmqImportPlan {
  const groups = new Map<string, PlannedGroup>();
  const placements = new Map<string, ResolvedRosterRow[]>();

  for (const row of rows) {
    const groupKey = `${row.pembina.id}:${row.unit.id}`;
    const sourceKey = `${PERIOD}:${groupKey}`;
    const existing = groups.get(groupKey);
    const member: PlannedMember = {
      ...row.participant,
      rowNumber: row.rowNumber,
      progressLevel: row.progressLevel,
    };

    if (existing) {
      existing.members.push(member);
      existing.progressCounts[row.progressLevel] += 1;
    } else {
      groups.set(groupKey, {
        sourceKey,
        name: `${row.pembina.fullName} — ${row.unit.name}`,
        pembina: row.pembina,
        unit: row.unit,
        members: [member],
        progressCounts: {
          pra_tahsin: row.progressLevel === "pra_tahsin" ? 1 : 0,
          tahsin: row.progressLevel === "tahsin" ? 1 : 0,
          tahfiz: row.progressLevel === "tahfiz" ? 1 : 0,
        },
      });
    }

    const participantPlacements = placements.get(row.participant.id) || [];
    participantPlacements.push(row);
    placements.set(row.participant.id, participantPlacements);
  }

  const blockingIssues: ImportBlockingIssue[] = [];
  for (const [participantId, participantPlacements] of placements) {
    if (participantPlacements.length < 2) continue;
    const [first] = participantPlacements;
    blockingIssues.push({
      kind: "duplicate-active-membership",
      participant: { id: participantId, fullName: first.participant.fullName },
      rowNumbers: participantPlacements.map((row) => row.rowNumber).sort((a, b) => a - b),
      message: `${first.participant.fullName} tercatat pada dua penempatan aktif (baris ${participantPlacements.map((row) => row.rowNumber).join(", ")}).`,
    });
  }

  return { groups: [...groups.values()], blockingIssues };
}
