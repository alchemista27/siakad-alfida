import {
  build2027_2028PeriodCreateData,
  plan2027_2028Periods,
  type PeriodSnapshot,
} from "./period-2027-2028-provisioning";

export type ProvisionMode = "dry-run" | "apply";
export type TargetCreateData = ReturnType<typeof build2027_2028PeriodCreateData>;

export type PeriodProvisioningTransaction = {
  findTarget(unitId: string): Promise<PeriodSnapshot | null>;
  createTarget(data: TargetCreateData): Promise<PeriodSnapshot>;
};

export type PeriodProvisioningPrisma = {
  transaction<T>(callback: (tx: PeriodProvisioningTransaction) => Promise<T>): Promise<T>;
};

export type ProvisioningSummary = {
  createCandidateCount: number;
  createdCount: number;
  skippedExistingCount: number;
  skippedExistingRaceCount: number;
  blockedCount: number;
  excludedCount: number;
  plannedQuota: number;
};

export class ProvisioningUsageError extends Error {
  readonly exitCode = 2;
}

export function parseProvisionMode(args: readonly string[]): ProvisionMode {
  if (args.length === 0 || (args.length === 1 && args[0] === "--dry-run")) return "dry-run";
  if (args.length === 1 && args[0] === "--apply") return "apply";
  throw new ProvisioningUsageError("Usage: pnpm --filter spmb-api ensure:periods:2027-2028 [--dry-run|--apply]");
}

export async function run2027_2028Provisioning({
  mode,
  periods,
  prisma,
}: {
  mode: ProvisionMode;
  periods: readonly PeriodSnapshot[];
  prisma: PeriodProvisioningPrisma;
}): Promise<ProvisioningSummary> {
  const actions = plan2027_2028Periods(periods);
  const creates = actions.filter((action) => action.kind === "create");
  const blockedCount = actions.filter((action) => action.kind === "blocked_missing_education_level").length;
  const excludedCount = actions.filter((action) => action.kind === "excluded_missing_quota_policy").length;
  const skippedExistingCount = actions.filter((action) => action.kind === "skipped_existing").length;
  const plannedQuota = creates.reduce((total, action) => total + action.quota, 0);

  const summary: ProvisioningSummary = {
    createCandidateCount: creates.length,
    createdCount: 0,
    skippedExistingCount,
    skippedExistingRaceCount: 0,
    blockedCount,
    excludedCount,
    plannedQuota,
  };

  if (mode === "dry-run") return summary;
  if (blockedCount > 0) {
    throw new Error("Provisioning diblokir karena metadata jenjang atau kelompok TK belum lengkap.");
  }

  for (const action of creates) {
    const outcome = await prisma.transaction(async (tx) => {
      const existing = await tx.findTarget(action.unitId);
      if (existing) return "skipped_existing_race" as const;
      await tx.createTarget(build2027_2028PeriodCreateData(action.source, action.quota));
      return "created" as const;
    });
    if (outcome === "created") summary.createdCount += 1;
    else summary.skippedExistingRaceCount += 1;
  }

  return summary;
}
