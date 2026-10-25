import { PeriodsService } from "../src/periods/periods.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function run() {
  const service = new PeriodsService({
    admissionPeriod: {
      findMany: async () => [
        {
          id: "period-open",
          unitId: "unit-1",
          sourceAcademicYearId: null,
          unitName: "SD Al-Fida",
          unitSlug: "sd",
          label: "2026/2027",
          quota: 10,
          fee: 250000,
          bankName: null,
          bankNumber: null,
          bankHolder: null,
          opensAt: null,
          closesAt: null,
          _count: { registrations: 7 },
        },
        {
          id: "period-full",
          unitId: "unit-2",
          sourceAcademicYearId: null,
          unitName: "SMP Al-Fida",
          unitSlug: "smp",
          label: "2026/2027",
          quota: 2,
          fee: 300000,
          bankName: null,
          bankNumber: null,
          bankHolder: null,
          opensAt: null,
          closesAt: null,
          _count: { registrations: 2 },
        },
      ],
    },
  } as any);

  const periods = await service.findActivePublic();
  assert(periods.length === 2, "full periods must remain visible to explain unavailable capacity");
  assert(periods[0].registeredCount === 7, "public period must expose registration count");
  assert(periods[0].availableSlots === 3, "public period must expose available capacity");
  assert(periods[0].isFull === false, "open capacity must not be marked full");
  assert(periods[1].availableSlots === 0, "availability must not go negative");
  assert(periods[1].isFull === true, "filled capacity must be marked full");

  console.log("SPMB public period capacity contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
