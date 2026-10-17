import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import type { SpmbPrincipal } from "../src/common/spmb-scope-policy";
import { DecisionsService } from "../src/decisions/decisions.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function expectRejects<T extends Error>(
  label: string,
  Exception: new (...args: any[]) => T,
  action: () => Promise<unknown>,
) {
  try {
    await action();
  } catch (error) {
    assert(error instanceof Exception, `${label}: expected ${Exception.name}, got ${(error as Error)?.name}`);
    return;
  }
  throw new Error(`${label}: expected ${Exception.name} to be thrown`);
}

const unitOneAdmin: SpmbPrincipal = {
  id: "admin-unit-1",
  roles: [{ app: "spmb", role: "admin_unit", unitId: "unit-1" }],
};
const unitOneStaff: SpmbPrincipal = {
  id: "staff-unit-1",
  roles: [{ app: "spmb", role: "tim_ppdb", unitId: "unit-1" }],
};
const unitTwoAdmin: SpmbPrincipal = {
  id: "admin-unit-2",
  roles: [{ app: "spmb", role: "admin_unit", unitId: "unit-2" }],
};

function createHarness() {
  const state = {
    registrations: [
      {
        id: "reg-1",
        registrationNumber: "SPMB-1",
        periodId: "period-1",
        status: "observation_done",
        handoffStatus: "not_ready",
        rejectionReason: null as string | null,
        period: { id: "period-1", unitId: "unit-1", label: "2026/2027" },
      },
      {
        id: "reg-2",
        registrationNumber: "SPMB-2",
        periodId: "period-1",
        status: "observation_done",
        handoffStatus: "not_ready",
        rejectionReason: null as string | null,
        period: { id: "period-1", unitId: "unit-1", label: "2026/2027" },
      },
      {
        id: "reg-unready",
        registrationNumber: "SPMB-3",
        periodId: "period-1",
        status: "verification",
        handoffStatus: "not_ready",
        rejectionReason: null as string | null,
        period: { id: "period-1", unitId: "unit-1", label: "2026/2027" },
      },
    ],
    events: [] as Array<Record<string, unknown>>,
    outbox: [] as Array<Record<string, unknown>>,
  };

  const makeClient = (snap: typeof state) => ({
    admissionPeriod: {
      findUnique: async ({ where }: any) =>
        where.id === "period-1" ? { id: "period-1", unitId: "unit-1", label: "2026/2027" } : null,
    },
    registration: {
      findUnique: async ({ where }: any) => snap.registrations.find((r) => r.id === where.id) ?? null,
      findMany: async ({ where }: any) => {
        if (where?.id?.in) return snap.registrations.filter((r) => where.id.in.includes(r.id));
        return snap.registrations;
      },
      update: async ({ where, data }: any) => {
        const target = snap.registrations.find((r) => r.id === where.id);
        if (!target) throw new Error("missing");
        Object.assign(target, data);
        return target;
      },
    },
    registrationEvent: {
      create: async ({ data }: any) => {
        snap.events.push(data);
        return data;
      },
    },
    handoffOutbox: {
      upsert: async ({ where, create, update }: any) => {
        const existing = snap.outbox.find((o) => o.registrationId === where.registrationId);
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }
        snap.outbox.push(create);
        return create;
      },
    },
  });

  const prisma: any = {
    ...makeClient(state),
    $transaction: async (cb: any) => {
      const clone = structuredClone(state);
      const res = await cb(makeClient(clone));
      state.registrations = clone.registrations;
      state.events = clone.events;
      state.outbox = clone.outbox;
      return res;
    },
  };

  return { state, service: new DecisionsService(prisma) };
}

async function main() {
  const { state, service } = createHarness();

  // 1. Only scoped admin_unit can decide (tim_ppdb rejected, foreign unit concealed)
  await expectRejects("tim_ppdb cannot decide", ForbiddenException, () =>
    service.setSingleDecision(unitOneStaff, { registrationId: "reg-1", status: "accepted" }),
  );
  await expectRejects("foreign admin_unit gets 404", NotFoundException, () =>
    service.setSingleDecision(unitTwoAdmin, { registrationId: "reg-1", status: "accepted" }),
  );

  // 2. Only observation_done -> accepted|rejected
  await expectRejects("unready registration rejected", BadRequestException, () =>
    service.setSingleDecision(unitOneAdmin, { registrationId: "reg-unready", status: "accepted" }),
  );

  // 3. Rejection note required and persisted
  await expectRejects("rejection without note rejected", BadRequestException, () =>
    service.setSingleDecision(unitOneAdmin, { registrationId: "reg-2", status: "rejected", note: "  " }),
  );
  await service.setSingleDecision(unitOneAdmin, {
    registrationId: "reg-2",
    status: "rejected",
    note: "Kuota penuh dan skor belum memenuhi batas minimal.",
  });
  assert(
    state.registrations.find((r) => r.id === "reg-2")?.rejectionReason ===
      "Kuota penuh dan skor belum memenuhi batas minimal.",
    "rejectionReason must be persisted on Registration",
  );

  // 4. Batch is all-or-nothing
  const { state: batchState, service: batchService } = createHarness();
  await expectRejects("batch with unready item rolls back", BadRequestException, () =>
    batchService.setBatchDecision(unitOneAdmin, {
      registrationIds: ["reg-1", "reg-unready"],
      status: "accepted",
    }),
  );
  assert(
    batchState.registrations.find((r) => r.id === "reg-1")?.status === "observation_done",
    "batch rollback must preserve reg-1 status",
  );

  // 5. Acceptance creates outbox work and sets handoffStatus pending
  await service.setSingleDecision(unitOneAdmin, {
    registrationId: "reg-1",
    status: "accepted",
    note: "Lulus seleksi observasi",
  });
  assert(state.registrations.find((r) => r.id === "reg-1")?.handoffStatus === "pending", "accepted must set handoffStatus pending");
  assert(state.outbox.length === 1, "accepted decision must enqueue handoff outbox work");

  console.log("SPMB decision contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
