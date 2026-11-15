import { PrismaClient } from "../src/generated/prisma";
import {
  is2027_2028TargetLabel,
  type PeriodSnapshot,
} from "../src/periods/period-2027-2028-provisioning";
import {
  ProvisioningUsageError,
  parseProvisionMode,
  run2027_2028Provisioning,
  type PeriodProvisioningTransaction,
} from "../src/periods/period-2027-2028-runner";

const prisma = new PrismaClient();

type PrismaPeriod = Awaited<ReturnType<typeof loadPeriods>>[number];

function toSnapshot(period: PrismaPeriod): PeriodSnapshot {
  return period;
}

async function loadPeriods() {
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

function transactionAdapter(tx: any): PeriodProvisioningTransaction {
  return {
    async findTarget(unitId) {
      const periods = await tx.admissionPeriod.findMany({
        where: { unitId },
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
      return periods.find((period: PrismaPeriod) => is2027_2028TargetLabel(period.label)) || null;
    },
    async createTarget(data) {
      return tx.admissionPeriod.create({ data });
    },
  };
}

async function main() {
  const mode = parseProvisionMode(process.argv.slice(2));
  const periods = (await loadPeriods()).map(toSnapshot);
  const summary = await run2027_2028Provisioning({
    mode,
    periods,
    prisma: {
      transaction: (callback) => prisma.$transaction((tx) => callback(transactionAdapter(tx))),
    },
  });

  console.log(JSON.stringify({ label: "2027/2028", mode, ...summary }, null, 2));
}

void main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = error instanceof ProvisioningUsageError ? error.exitCode : 1;
  })
  .finally(() => prisma.$disconnect());
