import { PrismaClient } from "../src/generated/prisma";
import {
  plan2027_2028Periods,
  type PeriodSnapshot,
} from "../src/periods/period-2027-2028-provisioning";

const prisma = new PrismaClient();

async function loadPeriods(): Promise<PeriodSnapshot[]> {
  return prisma.admissionPeriod.findMany({
    select: {
      id: true,
      unitId: true,
      unitName: true,
      unitSlug: true,
      label: true,
      educationLevel: true,
      tkGroup: true,
      isOpen: true,
      quota: true,
      fee: true,
      bankName: true,
      bankNumber: true,
      bankHolder: true,
      sourceAcademicYearId: true,
      opensAt: true,
      closesAt: true,
      createdAt: true,
    },
  });
}

async function main() {
  const actions = plan2027_2028Periods(await loadPeriods());
  const manifest = {
    label: "2027/2028",
    mode: "dry-run",
    generatedAt: new Date().toISOString(),
    actions: actions.map((action) => {
      const source = action.kind === "skipped_existing" ? action.target : action.source;
      return {
        unitId: action.unitId,
        unitName: source.unitName,
        action: action.kind,
        educationLevel: source.educationLevel,
        tkGroup: source.tkGroup,
        requestedQuota: action.kind === "create" ? action.quota : action.kind === "skipped_existing" ? action.requestedQuota : null,
        existingQuota: action.kind === "skipped_existing" ? action.target.quota : undefined,
        sourceLabel: source.label,
      };
    }),
    summary: {
      createCandidateCount: actions.filter((action) => action.kind === "create").length,
      skippedExistingCount: actions.filter((action) => action.kind === "skipped_existing").length,
      blockedCount: actions.filter((action) => action.kind === "blocked_missing_education_level" || action.kind === "blocked_missing_tk_group").length,
      excludedCount: actions.filter((action) => action.kind === "excluded_missing_quota_policy").length,
      plannedQuota: actions.reduce((sum, action) => sum + (action.kind === "create" ? action.quota : 0), 0),
    },
  };
  console.log(JSON.stringify(manifest, null, 2));
  if (manifest.summary.blockedCount > 0) process.exitCode = 2;
}

void main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
