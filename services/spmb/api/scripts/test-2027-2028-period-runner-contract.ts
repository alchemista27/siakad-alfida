import assert from "node:assert/strict";
import {
  ProvisioningUsageError,
  parseProvisionMode,
  run2027_2028Provisioning,
  type PeriodProvisioningPrisma,
} from "../src/periods/period-2027-2028-runner";
import type { PeriodSnapshot } from "../src/periods/period-2027-2028-provisioning";

function period(overrides: Partial<PeriodSnapshot> = {}): PeriodSnapshot {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    unitId: "22222222-2222-4222-8222-222222222222",
    unitName: "SD Uji",
    unitSlug: "sd-uji",
    label: "2026/2027",
    educationLevel: "sd",
    tkGroup: null,
    isOpen: false,
    quota: 60,
    fee: 250000,
    bankName: "BSI",
    bankNumber: "masked",
    bankHolder: "Yayasan",
    sourceAcademicYearId: null,
    opensAt: null,
    closesAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function fakePrisma(initialTargets: PeriodSnapshot[] = []): { prisma: PeriodProvisioningPrisma; creates: any[] } {
  const targets = [...initialTargets];
  const creates: any[] = [];
  const prisma: PeriodProvisioningPrisma = {
    transaction: async (callback) => callback({
      findTarget: async (unitId) => targets.find((candidate) => candidate.unitId === unitId) || null,
      createTarget: async (data) => {
        creates.push(data);
        const created = period({
          ...data,
          id: `created-${creates.length}`,
          createdAt: new Date("2026-11-01T00:00:00.000Z"),
        });
        targets.push(created);
        return created;
      },
    }),
  };
  return { prisma, creates };
}

async function expectRejects(action: () => Promise<unknown>, expected: RegExp) {
  await assert.rejects(action, expected);
}

async function main() {
  assert.equal(parseProvisionMode([]), "dry-run");
  assert.equal(parseProvisionMode(["--dry-run"]), "dry-run");
  assert.equal(parseProvisionMode(["--apply"]), "apply");
  assert.throws(
    () => parseProvisionMode(["--invalid"]),
    (error: unknown) => {
      if (!(error instanceof ProvisioningUsageError)) return false;
      return error.exitCode === 2;
    },
  );

  const source = period();
  const dryRun = fakePrisma();
  const drySummary = await run2027_2028Provisioning({ mode: "dry-run", periods: [source], prisma: dryRun.prisma });
  assert.equal(dryRun.creates.length, 0, "dry run must not write");
  assert.equal(drySummary.createCandidateCount, 1);
  assert.equal(drySummary.createdCount, 0);
  assert.equal(drySummary.plannedQuota, 175);

  const apply = fakePrisma();
  const applySummary = await run2027_2028Provisioning({ mode: "apply", periods: [source], prisma: apply.prisma });
  assert.equal(apply.creates.length, 1, "apply must create a missing target");
  assert.equal(apply.creates[0].label, "2027/2028");
  assert.equal(apply.creates[0].quota, 175);
  assert.equal(apply.creates[0].isOpen, false);
  assert.equal(apply.creates[0].opensAt.toISOString().slice(0, 10), "2026-11-01");
  assert.equal(apply.creates[0].closesAt.toISOString().slice(0, 10), "2026-11-30");
  assert.equal(applySummary.createdCount, 1);

  const existingVariant = period({ id: "33333333-3333-4333-8333-333333333333", label: "SPMB 2027/2028", quota: 100 });
  const existing = fakePrisma([existingVariant]);
  const existingSummary = await run2027_2028Provisioning({ mode: "apply", periods: [source, existingVariant], prisma: existing.prisma });
  assert.equal(existing.creates.length, 0, "SPMB 2027/2028 variant must not be duplicated");
  assert.equal(existingSummary.skippedExistingCount, 1);

  const race = fakePrisma([period({ id: "44444444-4444-4444-8444-444444444444", label: "2027/2028" })]);
  const raceSummary = await run2027_2028Provisioning({ mode: "apply", periods: [source], prisma: race.prisma });
  assert.equal(race.creates.length, 0, "transaction recheck must skip a concurrent target");
  assert.equal(raceSummary.skippedExistingRaceCount, 1);

  const blocked = fakePrisma();
  await expectRejects(
    () => run2027_2028Provisioning({
      mode: "apply",
      periods: [source, period({ id: "55555555-5555-4555-8555-555555555555", unitId: "66666666-6666-4666-8666-666666666666", educationLevel: null })],
      prisma: blocked.prisma,
    }),
    /metadata jenjang/i,
  );
  assert.equal(blocked.creates.length, 0, "blocked plan must make no writes");

  console.log("SPMB 2027/2028 period runner contract passed");
}

void main();
