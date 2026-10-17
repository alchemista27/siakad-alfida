import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { DocumentsService } from "../src/documents/documents.service";
import { ObservationsService } from "../src/observations/observations.service";
import { RegistrationsService } from "../src/registrations/registrations.service";
import type { SpmbPrincipal } from "../src/common/spmb-scope-policy";

const actorId = "parent-1";
const observerPrincipal: SpmbPrincipal = {
  id: actorId,
  roles: [{ app: "spmb", role: "observer", unitId: "unit-a" }],
};
const registrationId = "registration-1";
const sixRequiredDocuments = ["photo", "birth_certificate", "family_card", "father_id", "mother_id", "medical_result"];

async function expectBadRequest(label: string, action: () => Promise<unknown>, messagePart: string) {
  try {
    await action();
    throw new Error(`${label}: request unexpectedly succeeded`);
  } catch (error: any) {
    if (!(error instanceof BadRequestException) || !error.message.includes(messagePart)) {
      throw new Error(`${label}: expected BadRequest containing "${messagePart}", received "${error?.message || error}"`);
    }
  }
}

function registration(status: string, overrides: Record<string, unknown> = {}) {
  return {
    id: registrationId,
    parentId: actorId,
    periodId: "period-a",
    status,
    dossierReviewStatus: "pending",
    source: "online",
    period: { fee: 250000, unitId: "unit-a" },
    documents: [],
    events: [],
    observationBooking: null,
    ...overrides,
  };
}

async function run() {
  const observationCrossPeriod = new ObservationsService({
    $transaction: async (callback: any) => callback({
      registration: { findUnique: async () => registration("verification", { dossierReviewStatus: "approved" }) },
      observationSchedule: {
        findUnique: async () => ({ id: "schedule-b", periodId: "period-b", quota: 1, booked: 0, date: new Date(), startTime: "08:00" }),
        updateMany: async () => ({ count: 1 }),
        update: async () => ({}),
      },
      observationBooking: { create: async () => ({}), update: async () => ({}) },
      registrationEvent: { create: async () => ({}) },
    }),
  } as any);
  await expectBadRequest(
    "cross-period schedule booking",
    () => observationCrossPeriod.bookSchedule(actorId, { registrationId, observationScheduleId: "schedule-b" }),
    "periode pendaftaran"
  );

  const observationCapacity = new ObservationsService({
    $transaction: async (callback: any) => callback({
      registration: { findUnique: async () => registration("verification", { dossierReviewStatus: "approved" }) },
      observationSchedule: {
        findUnique: async () => ({ id: "schedule-a", periodId: "period-a", quota: 1, booked: 0, date: new Date(), startTime: "08:00" }),
        updateMany: async () => ({ count: 0 }),
        update: async () => ({}),
      },
      observationBooking: { create: async () => ({}), update: async () => ({}) },
      registrationEvent: { create: async () => ({}) },
    }),
  } as any);
  await expectBadRequest(
    "atomic schedule capacity reservation",
    () => observationCapacity.bookSchedule(actorId, { registrationId, observationScheduleId: "schedule-a" }),
    "penuh"
  );

  const medical = new DocumentsService({
    registration: { findUnique: async () => registration("medical_uploaded") },
    document: { findMany: async () => [] },
    registrationEvent: { create: async () => ({}) },
    $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
  } as any);
  await expectBadRequest(
    "medical stage without medical_result",
    () => medical.markMedicalDone(registrationId, actorId),
    "medical_result"
  );

  let submittedObserverId: string | null = null;
  const observationIdentity = new ObservationsService({
    $transaction: async (callback: any) => callback({
      registration: {
        findUnique: async () => registration("observation_scheduled", {
          observationBooking: { id: "booking-1", observationScheduleId: "schedule-1" },
        }),
        update: async () => ({}),
      },
      observationResult: {
        upsert: async ({ create }: any) => {
          submittedObserverId = create.observerId;
          return create;
        },
      },
      registrationEvent: { create: async () => ({}) },
      spmbObserver: { findFirst: async () => ({ id: "observer-assignment" }) },
    }),
  } as any);
  await observationIdentity.submitResult(observerPrincipal, {
    registrationId,
    score: 80,
    observerId: "attacker-controlled-observer-id",
  } as any);
  if (submittedObserverId !== actorId) {
    throw new Error("observation result must use authenticated observer identity");
  }

  const outOfOrderPayment = new RegistrationsService({
    registration: { findUnique: async () => registration("form_filling") },
    payment: { upsert: async () => { throw new Error("payment mutation must not occur"); } },
    registrationEvent: { create: async () => ({}) },
    $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
  } as any);
  await expectBadRequest(
    "out-of-order payment upload",
    () => outOfOrderPayment.uploadPayment(registrationId, actorId, { proofUrl: "https://example.test/proof.png" }),
    "Tahap"
  );

  const detachedRegistration = new RegistrationsService({
    registration: {
      findUnique: async () => registration("pending_payment", { parentId: null }),
      update: async () => { throw new Error("registration mutation must not occur"); },
    },
    payment: { upsert: async () => { throw new Error("payment mutation must not occur"); } },
    registrationEvent: { create: async () => ({}) },
    $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
  } as any);
  try {
    await detachedRegistration.uploadPayment(registrationId, actorId, { proofUrl: "https://example.test/proof.png" });
    throw new Error("unowned registration unexpectedly accepted a parent mutation");
  } catch (error) {
    if (!(error instanceof ForbiddenException)) {
      throw error;
    }
  }

  const malformedVerificationPrisma: any = {
    registration: {
      findUnique: async () => registration("verification", {
        documents: sixRequiredDocuments.map((type) => ({ type })),
      }),
    },
    registrationEvent: { create: async () => ({}) },
  };
  malformedVerificationPrisma.$transaction = async (callback: any) => callback(malformedVerificationPrisma);
  const malformedVerification = new RegistrationsService(malformedVerificationPrisma);
  await expectBadRequest(
    "string approval flag",
    () => malformedVerification.verifyDocuments(registrationId, { id: "admin-1", roles: [{ app: "spmb", role: "admin_unit", unitId: "unit-a" }] }, "false" as never),
    "boolean"
  );

  console.log("SPMB workflow guard regressions passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
