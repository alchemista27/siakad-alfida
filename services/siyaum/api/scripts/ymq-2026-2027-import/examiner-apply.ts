import type { ExaminerGender, ExaminerLevel, ExaminerTarget, PlannedExaminerAssignment } from "./examiners";

type ExistingExaminerAssignment = {
  id: string;
  academicYear: string;
  target: ExaminerTarget;
  gender: ExaminerGender;
  unitId: string | null;
  unitName: string | null;
  levels: ExaminerLevel[];
  examinerUserId: string;
};

type PlannedOperation = {
  action: "create" | "update" | "unchanged";
  planned: PlannedExaminerAssignment;
  existing?: ExistingExaminerAssignment;
};

export function buildYmqExaminerApplyPlan(planned: PlannedExaminerAssignment[], existing: ExistingExaminerAssignment[]) {
  const activeByScope = new Map(existing.map((entry) => [scopeKey(entry), entry]));
  const operations: PlannedOperation[] = planned.map((entry) => {
    const current = activeByScope.get(scopeKey(entry));
    if (!current) return { action: "create", planned: entry };
    return sameAssignment(entry, current)
      ? { action: "unchanged", planned: entry, existing: current }
      : { action: "update", planned: entry, existing: current };
  });
  const summary = operations.reduce((counts, operation) => ({ ...counts, [operation.action]: counts[operation.action] + 1 }), { create: 0, update: 0, unchanged: 0 });
  return { operations, summary };
}

export async function applyYmqExaminerImport(
  prisma: { $transaction: (callback: (tx: any) => Promise<void>) => Promise<void> },
  plan: ReturnType<typeof buildYmqExaminerApplyPlan>,
  assignedById: string,
) {
  await prisma.$transaction(async (tx) => {
    for (const operation of plan.operations) {
      if (operation.action === "unchanged") continue;
      if (operation.action === "update") {
        await tx.ymqExaminerAssignment.update({ where: { id: operation.existing!.id }, data: { revokedAt: new Date() } });
      }
      await tx.ymqExaminerAssignment.create({
        data: {
          academicYear: operation.planned.academicYear,
          target: operation.planned.target,
          gender: operation.planned.gender,
          unitId: operation.planned.unitId,
          unitName: operation.planned.unitName,
          levels: operation.planned.levels,
          examinerUserId: operation.planned.examinerUserId,
          assignedById,
        },
      });
    }
  });
  return plan.summary;
}

function scopeKey(entry: Pick<PlannedExaminerAssignment, "academicYear" | "target" | "gender" | "unitId">): string {
  return `${entry.academicYear}\u0000${entry.target}\u0000${entry.gender}\u0000${entry.unitId || "-"}`;
}

function sameAssignment(left: PlannedExaminerAssignment, right: ExistingExaminerAssignment): boolean {
  return left.examinerUserId === right.examinerUserId
    && left.unitName === right.unitName
    && left.levels.length === right.levels.length
    && left.levels.every((level, index) => level === right.levels[index]);
}
