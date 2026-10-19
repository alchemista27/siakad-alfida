import assert from "node:assert/strict";
import { ServiceUnavailableException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { PlacementService } from "../src/placement/placement.service";
import { SpmbConfirmationService } from "../src/spmb-confirmation/spmb-confirmation.service";

function makeMockPrisma(state: any) {
  const client: any = {
    enrollment: {
      findUnique: async ({ where }: any) => {
        const enrollment = state.enrollments.find((item: any) => item.id === where.id);
        if (!enrollment) return null;
        const student = state.students.find((item: any) => item.id === enrollment.studentId);
        return { ...enrollment, student: { ...student, admissionReceipt: state.receipts.find((item: any) => item.id === student.admissionReceiptId) ?? null } };
      },
      count: async ({ where }: any) => state.enrollments.filter((item: any) => item.classId === where.classId && item.status === where.status).length,
      update: async ({ where, data }: any) => { const index = state.enrollments.findIndex((item: any) => item.id === where.id); state.enrollments[index] = { ...state.enrollments[index], ...data }; return state.enrollments[index]; },
      findMany: async () => [],
    },
    classroom: { findUnique: async ({ where }: any) => state.classrooms.find((item: any) => item.id === where.id) ?? null },
    academicYear: { findUnique: async () => null },
    spmbConfirmationOutbox: {
      upsert: async ({ where, create }: any) => {
        const existing = state.outbox.find((item: any) => item.enrollmentId === where.enrollmentId);
        if (existing) return existing;
        const row = { id: `outbox-${state.outbox.length + 1}`, attempts: 0, status: "pending", availableAt: new Date(0), leasedUntil: null, leaseToken: null, deliveredAt: null, lastError: null, ...create };
        state.outbox.push(row);
        return row;
      },
      findFirst: async ({ where }: any) => state.outbox.find((item: any) => {
        const available = item.status === "pending" && item.availableAt <= where.OR[0].availableAt.lte;
        const expired = item.status === "delivering" && item.leasedUntil && item.leasedUntil <= where.OR[1].leasedUntil.lte;
        return available || expired;
      }) ?? null,
      updateMany: async ({ where, data }: any) => {
        const row = state.outbox.find((item: any) => item.id === where.id);
        if (!row || (where.leaseToken && row.leaseToken !== where.leaseToken)) return { count: 0 };
        if (where.status?.in && !where.status.in.includes(row.status)) return { count: 0 };
        if (where.status && typeof where.status === "string" && row.status !== where.status) return { count: 0 };
        Object.entries(data).forEach(([key, value]) => { (row as any)[key] = typeof value === "object" && value && "increment" in value ? Number((row as any)[key] ?? 0) + Number((value as any).increment) : value; });
        return { count: 1 };
      },
    },
  };
  client.$transaction = async (callback: any) => callback(client);
  return client;
}

async function main() {
  const state = {
    receipts: [{ id: "receipt-1", spmbRegistrationId: "registration-1" }],
    students: [{ id: "student-1", unitId: "unit-1", admissionReceiptId: "receipt-1" }],
    classrooms: [{ id: "class-1", unitId: "unit-1", academicYearId: "year-1", capacity: 30 }],
    enrollments: [{ id: "enrollment-1", studentId: "student-1", academicYearId: "year-1", classId: null, status: "pending_placement" }],
    outbox: [] as any[],
  };
  const prisma = makeMockPrisma(state);
  const admin: SiakadPrincipal = { id: "admin-1", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }] };
  const placement = new PlacementService(prisma);

  const placed = await placement.placeStudent(admin, { enrollmentId: "enrollment-1", classId: "class-1" });
  assert.equal(placed.status, "active");
  assert.equal(state.outbox.length, 1, "initial placement must write exactly one outbox record in the transaction");
  assert.deepEqual({ enrollmentId: state.outbox[0].enrollmentId, sourceRegistrationId: state.outbox[0].sourceRegistrationId, status: state.outbox[0].status }, { enrollmentId: "enrollment-1", sourceRegistrationId: "registration-1", status: "pending" });
  await assert.rejects(() => placement.placeStudent(admin, { enrollmentId: "enrollment-1", classId: "class-1" }), /menunggu penempatan/);

  const oldUrl = process.env.SPMB_CONFIRMATION_URL;
  const oldSecret = process.env.SPMB_CONFIRMATION_SECRET;
  delete process.env.SPMB_CONFIRMATION_URL;
  delete process.env.SPMB_CONFIRMATION_SECRET;
  const dueNow = new Date(state.outbox[0].availableAt.getTime() + 1);
  const unavailable = new SpmbConfirmationService(prisma, async () => { throw new Error("must not call HTTP without configuration"); });
  await assert.rejects(() => unavailable.deliverNext(dueNow), ServiceUnavailableException);
  assert.equal(state.outbox[0].status, "pending", "missing configuration must leave the outbox untouched");

  process.env.SPMB_CONFIRMATION_URL = "https://spmb.example.test/internal/placement-confirmations";
  process.env.SPMB_CONFIRMATION_SECRET = "shared-secret";
  let request: { url: string; init: RequestInit } | null = null;
  const delivery = new SpmbConfirmationService(prisma, async (url, init) => { request = { url, init }; return new Response(JSON.stringify({ accepted: true }), { status: 200, headers: { "content-type": "application/json" } }); });
  const delivered = await delivery.deliverNext(dueNow);
  assert.equal(delivered?.status, "delivered");
  assert.equal(state.outbox[0].status, "delivered");
  assert.equal(request?.url, process.env.SPMB_CONFIRMATION_URL);
  assert.equal((request?.init.headers as Record<string, string>)["Idempotency-Key"], state.outbox[0].idempotencyKey);
  assert.equal((request?.init.headers as Record<string, string>)["x-internal-service-key"], "shared-secret");
  assert.deepEqual(JSON.parse(String(request?.init.body)), {
    sourceRegistrationId: "registration-1",
    destinationEnrollmentId: "enrollment-1",
  });

  state.outbox.push({ id: "outbox-retry", enrollmentId: "enrollment-retry", sourceRegistrationId: "registration-retry", academicYearId: "year-1", classId: "class-1", idempotencyKey: "confirm:enrollment-retry", attempts: 0, status: "pending", availableAt: new Date(0), leasedUntil: null, leaseToken: null, deliveredAt: null, lastError: null });
  const failing = new SpmbConfirmationService(prisma, async () => { throw new Error("network down"); });
  const retried = await failing.deliverNext(new Date("2026-10-18T00:00:00.000Z"));
  assert.equal(retried?.status, "pending");
  const retryRow = state.outbox.find((item: any) => item.id === "outbox-retry");
  assert.equal(retryRow.attempts, 1);
  assert.ok(retryRow.availableAt > new Date("2026-10-18T00:00:00.000Z"));
  assert.match(retryRow.lastError, /network down/);

  if (oldUrl === undefined) delete process.env.SPMB_CONFIRMATION_URL; else process.env.SPMB_CONFIRMATION_URL = oldUrl;
  if (oldSecret === undefined) delete process.env.SPMB_CONFIRMATION_SECRET; else process.env.SPMB_CONFIRMATION_SECRET = oldSecret;
  console.log("SPMB confirmation outbox contract passed");
}

void main();
