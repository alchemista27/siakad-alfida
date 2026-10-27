import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { SpmbPrincipal } from "../src/common/spmb-scope-policy";
import { ObserversService } from "../src/observers/observers.service";

const unitA = "unit-a";
const unitB = "unit-b";
const adminA: SpmbPrincipal = {
  id: "admin-a",
  roles: [{ app: "spmb", role: "admin_unit", unitId: unitA }],
};
const observerA: SpmbPrincipal = {
  id: "observer-a",
  roles: [{ app: "spmb", role: "observer", unitId: unitA }],
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function expectException<T extends Error>(
  label: string,
  Exception: new (...args: any[]) => T,
  action: () => Promise<unknown>,
) {
  try {
    await action();
    throw new Error(`${label}: request unexpectedly succeeded`);
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
  }
}

function period(unitId = unitA) {
  return { id: "period-a", unitId };
}

function registration(overrides: Record<string, unknown> = {}) {
  return {
    id: "registration-a",
    periodId: "period-a",
    registrationNumber: "SPMB-A-001",
    status: "observation_scheduled",
    period: period(),
    observationBooking: { id: "booking-a", observationScheduleId: "schedule-a" },
    observationResult: null,
    ...overrides,
  };
}

async function run() {
  const assignments = new ObserversService({
    spmbObserver: { upsert: async () => ({}) },
  } as any);
  await expectException("foreign observer assignment", ForbiddenException, () =>
    assignments.assign(adminA, { userId: "observer-b", unitId: unitB }),
  );

  const inactive = new ObserversService({
    admissionPeriod: { findUnique: async () => period() },
    spmbObserver: { findFirst: async () => null },
  } as any);
  await expectException("inactive observer worklist", ForbiddenException, () => inactive.getMyWorklist(observerA, "period-a"));

  let worklistWhere: any;
  const worklist = new ObserversService({
    admissionPeriod: { findUnique: async () => period() },
    spmbObserver: { findFirst: async () => ({ id: "membership-a" }) },
    registration: {
      findMany: async ({ where }: any) => {
        worklistWhere = where;
        return [];
      },
    },
  } as any);
  await worklist.getMyWorklist(observerA, "period-a");
  assert(worklistWhere.observationBooking?.isNot === null, "observer worklist must require a persisted booking");
  assert(worklistWhere.periodId === "period-a", "observer worklist must be period-scoped");

  let submittedObserverId: string | null = null;
  const results = new ObserversService({
    $transaction: async (callback: any) => callback({
      registration: {
        findUnique: async () => registration(),
        update: async () => ({}),
      },
      spmbObserver: { findFirst: async () => ({ id: "membership-a" }) },
      observationResult: {
        upsert: async ({ create }: any) => {
          submittedObserverId = create.observerId;
          return create;
        },
      },
      registrationEvent: { create: async () => ({}) },
    }),
  } as any);
  await results.submitMyResult(observerA, { registrationId: "registration-a", score: 88, notes: "ok" });
  assert(submittedObserverId === observerA.id, "result identity must come from the authenticated actor");

  const foreignResult = new ObserversService({
    $transaction: async (callback: any) => callback({
      registration: { findUnique: async () => registration({ period: period(unitB) }) },
    }),
  } as any);
  await expectException("foreign observer result", NotFoundException, () =>
    foreignResult.submitMyResult(observerA, { registrationId: "registration-b", score: 75 }),
  );

  let rankWrite = false;
  const rankings = new ObserversService({
    admissionPeriod: { findUnique: async () => period() },
    spmbObserver: { findFirst: async () => ({ id: "membership-a" }) },
    registration: {
      findMany: async () => [
        registration({ id: "registration-2", registrationNumber: "SPMB-A-002", observationResult: { id: "result-2", score: 90, createdAt: new Date("2026-01-02"), notes: null } }),
        registration({ id: "registration-1", registrationNumber: "SPMB-A-001", observationResult: { id: "result-1", score: 90, createdAt: new Date("2026-01-01"), notes: null } }),
      ],
    },
    observationResult: { update: async () => { rankWrite = true; return {}; } },
  } as any);
  const ranked = await rankings.getMyRankings(observerA, "period-a");
  assert(ranked.map((row: any) => row.registrationId).join(",") === "registration-1,registration-2", "ties must sort by createdAt then result id");
  assert(!rankWrite, "GET rankings must not write rank state");

  console.log("SPMB observer scope contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
