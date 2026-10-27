import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import type { SpmbPrincipal } from "../src/common/spmb-scope-policy";
import { DecisionsService } from "../src/decisions/decisions.service";
import { HandoffService } from "../src/handoff/handoff.service";
import { ObservationsService } from "../src/observations/observations.service";
import { PeriodsService } from "../src/periods/periods.service";

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
const superAdmin: SpmbPrincipal = {
  id: "super-admin",
  roles: [{ app: "*", role: "super_admin" }],
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

function foreignPeriod(id = "period-b") {
  return {
    id,
    unitId: unitB,
    unitName: "Unit B",
    unitSlug: "unit-b",
    label: "2026/2027",
    fee: 250000,
  };
}

function foreignRegistration() {
  return {
    id: "registration-b",
    registrationNumber: "SPMB-UNIT-B-0001",
    periodId: "period-b",
    status: "observation_done",
    handoffStatus: "not_ready",
    period: foreignPeriod(),
  };
}

async function run() {
  let listWhere: unknown;
  const periods = new PeriodsService({
    admissionPeriod: {
      findMany: async ({ where }: any) => {
        listWhere = where;
        return [];
      },
      findUnique: async ({ where }: any) => foreignPeriod(where.id),
    },
  } as any);

  await periods.findAll(adminA);
  assert(
    JSON.stringify(listWhere) === JSON.stringify({ unitId: { in: [unitA] } }),
    "period collection must derive its filter from the caller's unit role",
  );
  await periods.findAll(observerA);
  assert(
    JSON.stringify(listWhere) === JSON.stringify({ unitId: { in: [unitA] } }),
    "observer period listing must be limited to the observer's unit",
  );
  await expectException("foreign period detail", NotFoundException, () => periods.findOne("period-b", adminA));
  await periods.findOne("period-b", superAdmin);

  const decisions = new DecisionsService({
    $transaction: async (callback: any) => callback({
      registration: { findUnique: async () => foreignRegistration() },
      registrationEvent: { create: async () => ({}) },
    }),
  } as any);
  await expectException("foreign decision", NotFoundException, () =>
    (decisions.setSingleDecision as any)(adminA, { registrationId: "registration-b", status: "accepted" }),
  );


  const schedules = new ObservationsService({
    admissionPeriod: { findUnique: async () => foreignPeriod() },
    observationSchedule: { create: async () => ({}) },
  } as any);
  await expectException("foreign schedule creation", NotFoundException, () =>
    (schedules.createSchedule as any)(
      { periodId: "period-b", date: "2026-01-01", startTime: "08:00", endTime: "09:00", quota: 10 },
      adminA,
    ),
  );

  const foreignObservation = new ObservationsService({
    $transaction: async (callback: any) => callback({
      registration: {
        findUnique: async () => ({ ...foreignRegistration(), status: "observation_scheduled" }),
        update: async () => ({}),
      },
      observationResult: { upsert: async () => ({}) },
      registrationEvent: { create: async () => ({}) },
      spmbObserver: { findFirst: async () => null },
    }),
  } as any);
  await expectException("foreign observation submission", NotFoundException, () =>
    (foreignObservation.submitResult as any)(observerA, { registrationId: "registration-b", score: 80 }),
  );

  const inactiveObserver = new ObservationsService({
    $transaction: async (callback: any) => callback({
      registration: {
        findUnique: async () => ({
          ...foreignRegistration(),
          period: { ...foreignPeriod(), unitId: unitA },
          status: "observation_scheduled",
        }),
        update: async () => ({}),
      },
      observationResult: { upsert: async () => ({}) },
      registrationEvent: { create: async () => ({}) },
      spmbObserver: { findFirst: async () => null },
    }),
  } as any);
  await expectException("inactive observer submission", ForbiddenException, () =>
    (inactiveObserver.submitResult as any)(observerA, { registrationId: "registration-a", score: 80 }),
  );

  const rankings = new ObservationsService({
    admissionPeriod: { findUnique: async () => foreignPeriod() },
    registration: { findMany: async () => [] },
  } as any);
  await expectException("foreign rankings", NotFoundException, () =>
    (rankings.getRankings as any)("period-b", adminA),
  );

  const handoff = new HandoffService({
    admissionPeriod: { findUnique: async () => foreignPeriod() },
    registration: {
      findUnique: async () => ({
        ...foreignRegistration(),
        parent: { id: "parent-b", fullName: "Parent", email: "p@example.test", phone: null },
        studentData: { id: "student-b", fullName: "Student", birthDate: new Date(), gender: "male" },
        parentData: [],
      }),
      findMany: async () => [],
    },
  } as any);
  await expectException("foreign handoff status", NotFoundException, () =>
    (handoff.listHandoffStatus as any)("period-b", adminA),
  );
  await expectException("foreign handoff sync", NotFoundException, () =>
    (handoff.syncSingle as any)(adminA, { registrationId: "registration-b" }),
  );

  console.log("SPMB unit-scoped staff authorization contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
