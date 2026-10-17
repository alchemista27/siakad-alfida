import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { SpmbPrincipal } from "../src/common/spmb-scope-policy";
import { ObservationsService } from "../src/observations/observations.service";

const unitA = "unit-a";
const unitB = "unit-b";
const parentId = "parent-a";
const adminA: SpmbPrincipal = {
  id: "admin-a",
  roles: [{ app: "spmb", role: "admin_unit", unitId: unitA }],
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

function schedule(overrides: Record<string, unknown> = {}) {
  return {
    id: "schedule-a",
    periodId: "period-a",
    quota: 2,
    booked: 1,
    date: new Date("2026-01-10"),
    startTime: "08:00",
    endTime: "09:00",
    period: { id: "period-a", unitId: unitA },
    _count: { bookings: 1 },
    ...overrides,
  };
}

function registration(overrides: Record<string, unknown> = {}) {
  return {
    id: "registration-a",
    parentId,
    periodId: "period-a",
    status: "verification",
    source: "online",
    events: [{ kind: "verification_approved" }],
    observationBooking: null,
    ...overrides,
  };
}

async function run() {
  const foreignSchedule = new ObservationsService({
    observationSchedule: { findUnique: async () => schedule({ period: { unitId: unitB } }) },
  } as any);
  await expectException("foreign schedule update", NotFoundException, () =>
    (foreignSchedule.updateSchedule as any)("schedule-a", { quota: 3 }, adminA),
  );

  const quotaBelowBooked = new ObservationsService({
    observationSchedule: { findUnique: async () => schedule({ booked: 2, _count: { bookings: 2 } }) },
  } as any);
  await expectException("quota below booked", BadRequestException, () =>
    (quotaBelowBooked.updateSchedule as any)("schedule-a", { quota: 1 }, adminA),
  );

  const deleteWithBookings = new ObservationsService({
    $transaction: async (callback: any, options: any) => {
      assert(options?.isolationLevel === "Serializable", "schedule deletion must be serializable");
      return callback({
        observationSchedule: {
          findUnique: async () => schedule({ _count: { bookings: 1 } }),
          deleteMany: async () => ({ count: 0 }),
        },
      });
    },
  } as any);
  await expectException("delete schedule with booking", BadRequestException, () =>
    deleteWithBookings.deleteSchedule("schedule-a", adminA),
  );

  const revisionRequired = new ObservationsService({
    $transaction: async (callback: any, options: any) => {
      assert(options?.isolationLevel === "Serializable", "booking must use a serializable transaction");
      return callback({
        registration: { findUnique: async () => registration({ dossierReviewStatus: "revision_required" }) },
        observationSchedule: {
          findUnique: async () => schedule({ booked: 0, _count: { bookings: 0 } }),
          updateMany: async () => ({ count: 1 }),
          update: async () => ({}),
        },
        observationBooking: { create: async () => ({}) },
        registrationEvent: { create: async () => ({}) },
      });
    },
  } as any);
  await expectException("dossier review gate", BadRequestException, () =>
    revisionRequired.bookSchedule(parentId, { registrationId: "registration-a", observationScheduleId: "schedule-a" }),
  );

  let booked = 0;
  const concurrentBookings = new ObservationsService({
    $transaction: async (callback: any, options: any) => {
      assert(options?.isolationLevel === "Serializable", "last-slot booking must be serializable");
      return callback({
        registration: {
          findUnique: async ({ where }: any) => registration({
            id: where.id,
            parentId: where.id.replace("registration", "parent"),
            dossierReviewStatus: "approved",
          }),
          update: async () => ({}),
        },
        observationSchedule: {
          findUnique: async () => schedule({ quota: 1, booked }),
          updateMany: async () => {
            if (booked >= 1) return { count: 0 };
            booked += 1;
            return { count: 1 };
          },
          update: async () => ({}),
        },
        observationBooking: { create: async () => ({}) },
        registrationEvent: { create: async () => ({}) },
      });
    },
  } as any);
  const bookingResults = await Promise.allSettled([
    concurrentBookings.bookSchedule("parent-1", { registrationId: "registration-1", observationScheduleId: "schedule-a" }),
    concurrentBookings.bookSchedule("parent-2", { registrationId: "registration-2", observationScheduleId: "schedule-a" }),
  ]);
  assert(bookingResults.filter((result) => result.status === "fulfilled").length === 1, "exactly one concurrent last-slot booking may succeed");
  assert(booked === 1, "last-slot booking counter must finish at one");

  const counters = { old: 1, next: 0 };
  const rebooking = new ObservationsService({
    $transaction: async (callback: any, options: any) => {
      assert(options?.isolationLevel === "Serializable", "rebooking must be serializable");
      return callback({
        registration: {
          findUnique: async () => registration({
            status: "observation_scheduled",
            dossierReviewStatus: "approved",
            observationBooking: { id: "booking-a", observationScheduleId: "schedule-old" },
          }),
          update: async () => ({}),
        },
        observationSchedule: {
          findUnique: async () => schedule({ id: "schedule-next", quota: 1, booked: counters.next }),
          updateMany: async () => {
            if (counters.next >= 1) return { count: 0 };
            counters.next += 1;
            return { count: 1 };
          },
          update: async ({ where, data }: any) => {
            if (where.id === "schedule-old" && data.booked?.decrement === 1) counters.old -= 1;
            return {};
          },
        },
        observationBooking: { update: async () => ({}) },
        registrationEvent: { create: async () => ({}) },
      });
    },
  } as any);
  await rebooking.bookSchedule(parentId, { registrationId: "registration-a", observationScheduleId: "schedule-next" });
  assert(counters.old === 0 && counters.next === 1, "rebooking must decrement the old counter and increment the new counter exactly once");

  console.log("SPMB observation schedule contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
