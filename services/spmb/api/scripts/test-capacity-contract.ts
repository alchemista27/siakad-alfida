import { BadRequestException, ConflictException } from "@nestjs/common";
import { AdmissionCapacityService } from "../src/registrations/admission-capacity.service";
import { InvitesService } from "../src/invites/invites.service";
import { ObservationsService } from "../src/observations/observations.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function createBarrierRepository(
  quota: number,
  initialCounter: { periodId: string; nextSequence: number; intakeReserved: number; acceptedCount: number } | null = null,
) {
  const period = {
    id: "period-concurrency-1",
    unitId: "unit-1",
    unitSlug: "sdit-1",
    unitName: "SDIT Alfida",
    label: "2026/2027",
    isOpen: true,
    quota,
    fee: 250000,
  };

  let counter: { periodId: string; nextSequence: number; intakeReserved: number; acceptedCount: number } = initialCounter ?? {
    periodId: period.id,
    nextSequence: 1,
    intakeReserved: 0,
    acceptedCount: 0,
  };

  const registrations = new Map<string, any>();
  const users = new Map<string, any>();
  const observationSchedules = new Map<string, any>();
  const observationBookings = new Map<string, any>();

  // In-memory mutex for serializing transactional updates per repository double
  let mutex = Promise.resolve();
  async function lock<T>(fn: () => Promise<T>): Promise<T> {
    const prev = mutex;
    let release!: () => void;
    mutex = new Promise<void>((res) => {
      release = res;
    });
    await prev;
    try {
      return await fn();
    } finally {
      release();
    }
  }

  const client: any = {
    admissionPeriod: {
      findUnique: async ({ where }: any) => {
        if (where.id === period.id) return { ...period };
        return null;
      },
    },
    admissionPeriodCounter: {
      findUnique: async ({ where }: any) => {
        if (where.periodId === period.id) return { ...counter };
        return null;
      },
      create: async ({ data }: any) => {
        counter = { ...data };
        return { ...counter };
      },
      update: async ({ where, data }: any) => {
        if (where.periodId === period.id) {
          counter = {
            ...counter,
            nextSequence: data.nextSequence !== undefined ? data.nextSequence : counter.nextSequence,
            intakeReserved: data.intakeReserved !== undefined ? data.intakeReserved : counter.intakeReserved,
            acceptedCount: data.acceptedCount !== undefined ? data.acceptedCount : counter.acceptedCount,
          };
          return { ...counter };
        }
        throw new Error("counter not found");
      },
    },
    registration: {
      findUnique: async ({ where }: any) => {
        if (where.id) return registrations.get(where.id) ? { ...registrations.get(where.id) } : null;
        if (where.inviteToken) {
          for (const reg of registrations.values()) {
            if (reg.inviteToken === where.inviteToken) return { ...reg };
          }
          return null;
        }
        if (where.periodId_externalRef) {
          for (const reg of registrations.values()) {
            if (
              reg.periodId === where.periodId_externalRef.periodId &&
              reg.externalRef === where.periodId_externalRef.externalRef
            ) {
              return { ...reg };
            }
          }
          return null;
        }
        return null;
      },
      findFirst: async ({ where }: any) => {
        for (const reg of registrations.values()) {
          if (where.parentId && reg.parentId === where.parentId && reg.periodId === where.periodId) {
            return { ...reg };
          }
        }
        return null;
      },
      count: async ({ where }: any) => {
        let cnt = 0;
        for (const reg of registrations.values()) {
          if (reg.periodId === where.periodId) cnt++;
        }
        return cnt;
      },
      create: async ({ data }: any) => {
        const id = `reg-${registrations.size + 1}`;
        const record = { id, ...data };
        registrations.set(id, record);
        return { ...record };
      },
      update: async ({ where, data }: any) => {
        const existing = registrations.get(where.id);
        if (!existing) throw new Error("not found");
        const updated = { ...existing, ...data };
        registrations.set(where.id, updated);
        return { ...updated };
      },
      updateMany: async ({ where, data }: any) => {
        return lock(async () => {
          let count = 0;
          for (const [id, reg] of registrations.entries()) {
            if (where.id && reg.id !== where.id) continue;
            if (where.inviteToken && reg.inviteToken !== where.inviteToken) continue;
            if (where.parentId === null && reg.parentId !== null) continue;
            if (where.claimedAt === null && reg.claimedAt !== null) continue;
            if (where.inviteExpiresAt?.gt && !(reg.inviteExpiresAt > where.inviteExpiresAt.gt)) continue;

            registrations.set(id, { ...reg, ...data });
            count++;
          }
          return { count };
        });
      },
    },
    user: {
      upsert: async ({ where, create, update }: any) => {
        const existing = users.get(where.id);
        if (existing) {
          const updated = { ...existing, ...update };
          users.set(where.id, updated);
          return updated;
        }
        const created = { id: where.id, ...create };
        users.set(where.id, created);
        return created;
      },
    },
    studentData: {
      create: async ({ data }: any) => ({ id: `std-${Date.now()}`, ...data }),
    },
    payment: {
      create: async ({ data }: any) => ({ id: `pay-${Date.now()}`, ...data }),
    },
    registrationEvent: {
      create: async ({ data }: any) => ({ id: `ev-${Date.now()}`, ...data }),
    },
    observationSchedule: {
      findUnique: async ({ where }: any) => {
        const found = observationSchedules.get(where.id);
        return found ? { ...found } : null;
      },
      updateMany: async ({ where, data }: any) => {
        return lock(async () => {
          const schedule = observationSchedules.get(where.id);
          if (!schedule) return { count: 0 };
          if (where.periodId && schedule.periodId !== where.periodId) return { count: 0 };
          if (where.booked?.lt !== undefined && !(schedule.booked < where.booked.lt)) return { count: 0 };

          const increment = data.booked?.increment ?? 0;
          const updated = { ...schedule, booked: schedule.booked + increment };
          observationSchedules.set(where.id, updated);
          return { count: 1 };
        });
      },
    },
    observationBooking: {
      create: async ({ data }: any) => {
        const id = `book-${observationBookings.size + 1}`;
        const record = { id, ...data };
        observationBookings.set(id, record);
        return { ...record };
      },
      update: async ({ where, data }: any) => {
        const cur = observationBookings.get(where.id);
        const updated = { ...cur, ...data };
        observationBookings.set(where.id, updated);
        return updated;
      },
    },
  };

  client.$transaction = async (callback: any) => {
    return callback(client);
  };

  return { client, registrations, observationSchedules, observationBookings, getCounter: () => ({ ...counter }) };
}

async function run() {
  const historicalHarness = createBarrierRepository(10, {
    periodId: "period-concurrency-1",
    nextSequence: 8,
    intakeReserved: 7,
    acceptedCount: 2,
  });
  const historicalCapacityService = new AdmissionCapacityService(historicalHarness.client);
  const historicalAllocation = await historicalCapacityService.allocateRegistrationNumber(
    historicalHarness.client,
    "period-concurrency-1",
  );
  assert(historicalAllocation.sequence === 8, "backfilled counter must continue after the largest registration suffix");
  assert(historicalAllocation.registrationNumber === "PPDB-SDIT-1-2026-0008", "new draft must not reuse an historic registration number");
  const historicalCounter = historicalHarness.getCounter();
  assert(historicalCounter.nextSequence === 9, "allocation must advance the persisted sequence");
  assert(historicalCounter.intakeReserved === 8, "allocation must retain historical reserved capacity");

  const quota = 5;
  const harness = createBarrierRepository(quota);
  const capacityService = new AdmissionCapacityService(harness.client);

  // 1. Quota + 3 concurrent registrations yield exactly quota successes, all numbers unique
  const totalConcurrent = quota + 3; // 8 callers
  const promises = Array.from({ length: totalConcurrent }, (_, i) => {
    return capacityService.allocateRegistrationNumber(harness.client, "period-concurrency-1");
  });

  const results = await Promise.allSettled(promises);
  const successes = results.filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled");
  const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");

  assert(
    successes.length === quota,
    `expected exactly ${quota} successes from ${totalConcurrent} concurrent allocations, got ${successes.length}`,
  );
  assert(
    failures.length === 3,
    `expected exactly 3 failures from ${totalConcurrent} concurrent allocations, got ${failures.length}`,
  );

  for (const failure of failures) {
    assert(
      failure.reason instanceof BadRequestException && failure.reason.message.toLowerCase().includes("kuota"),
      `expected BadRequestException regarding kuota, got: ${failure.reason}`,
    );
  }

  const registrationNumbers = successes.map((s) => s.value.registrationNumber);
  const uniqueNumbers = new Set(registrationNumbers);
  assert(
    uniqueNumbers.size === quota,
    `expected ${quota} unique registration numbers, got ${uniqueNumbers.size} (${registrationNumbers.join(", ")})`,
  );

  const counterState = harness.getCounter();
  assert(counterState.intakeReserved === quota, `intakeReserved must be ${quota}, got ${counterState.intakeReserved}`);
  assert(counterState.nextSequence === quota + 1, `nextSequence must be ${quota + 1}, got ${counterState.nextSequence}`);

  // 2. Legacy claims have one winner
  const inviteToken = "claim-token-uuid-12345";
  const claimRegId = "reg-claimable-1";
  const claimReg = {
    id: claimRegId,
    periodId: "period-concurrency-1",
    registrationNumber: "PPDB-SDIT-2026-0001",
    status: "pending_payment",
    parentId: null,
    claimedAt: null,
    inviteToken,
    inviteExpiresAt: new Date(Date.now() + 86400000),
    guardianName: "Wali Calon",
    period: { unitName: "SDIT Alfida" },
  };
  harness.registrations.set(claimRegId, claimReg);

  const invitesService = new InvitesService(harness.client);
  const parent1 = { id: "parent-winner-1", email: "p1@example.test", fullName: "Parent One" };
  const parent2 = { id: "parent-loser-2", email: "p2@example.test", fullName: "Parent Two" };

  const claimResults = await Promise.allSettled([
    invitesService.claimInvite(inviteToken, parent1),
    invitesService.claimInvite(inviteToken, parent2),
  ]);

  const claimSuccesses = claimResults.filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled");
  const claimFailures = claimResults.filter((r): r is PromiseRejectedResult => r.status === "rejected");

  assert(claimSuccesses.length === 1, `exactly 1 claim winner expected, got ${claimSuccesses.length}`);
  assert(claimFailures.length === 1, `exactly 1 claim failure expected, got ${claimFailures.length}`);
  assert(
    claimFailures[0].reason instanceof ConflictException,
    `claim loser must receive ConflictException, got: ${claimFailures[0].reason}`,
  );

  // 3. Last-slot bookings have one winner
  const scheduleId = "sched-last-slot";
  harness.observationSchedules.set(scheduleId, {
    id: scheduleId,
    periodId: "period-concurrency-1",
    quota: 5,
    booked: 4, // 1 slot left
    date: new Date("2026-06-01T08:00:00.000Z"),
    startTime: "08:00",
  });

  const regBook1Id = "reg-book-1";
  const regBook2Id = "reg-book-2";
  const parentBook1Id = "parent-book-1";
  const parentBook2Id = "parent-book-2";

  harness.registrations.set(regBook1Id, {
    id: regBook1Id,
    periodId: "period-concurrency-1",
    parentId: parentBook1Id,
    status: "verification",
    dossierReviewStatus: "approved",
    observationBooking: null,
  });
  harness.registrations.set(regBook2Id, {
    id: regBook2Id,
    periodId: "period-concurrency-1",
    parentId: parentBook2Id,
    status: "verification",
    dossierReviewStatus: "approved",
    observationBooking: null,
  });

  const observationsService = new ObservationsService(harness.client);
  const bookResults = await Promise.allSettled([
    observationsService.bookSchedule(parentBook1Id, {
      registrationId: regBook1Id,
      observationScheduleId: scheduleId,
    }),
    observationsService.bookSchedule(parentBook2Id, {
      registrationId: regBook2Id,
      observationScheduleId: scheduleId,
    }),
  ]);

  const bookSuccesses = bookResults.filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled");
  const bookFailures = bookResults.filter((r): r is PromiseRejectedResult => r.status === "rejected");

  assert(bookSuccesses.length === 1, `exactly 1 booking winner expected, got ${bookSuccesses.length}`);
  assert(bookFailures.length === 1, `exactly 1 booking failure expected, got ${bookFailures.length}`);
  assert(
    bookFailures[0].reason instanceof BadRequestException &&
      bookFailures[0].reason.message.toLowerCase().includes("penuh"),
    `booking loser must receive BadRequestException for slot full, got: ${bookFailures[0].reason}`,
  );

  console.log("SPMB capacity contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
