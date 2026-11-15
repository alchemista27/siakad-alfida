import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { RegistrationsService } from "../src/registrations/registrations.service";
import { ObservationsService } from "../src/observations/observations.service";
import type { SpmbPrincipal } from "../src/common/spmb-scope-policy";

const registrationId = "11111111-1111-4111-8111-111111111111";
const parentId = "22222222-2222-4222-8222-222222222222";
const unitId = "33333333-3333-4333-8333-333333333333";
const staff: SpmbPrincipal = { id: "staff-1", roles: [{ app: "spmb", role: "tim_spmb", unitId }] };
const basicDocumentTypes = ["photo", "birth_certificate", "family_card", "father_id", "mother_id"];
const allDocumentTypes = [...basicDocumentTypes, "medical_result"];

async function expectRejects(label: string, fn: () => Promise<unknown>, Expected: new (...args: any[]) => Error, message?: string) {
  try {
    await fn();
    throw new Error(`${label}: unexpectedly succeeded`);
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("unexpectedly succeeded")) throw error;
    if (!(error instanceof Expected) || (message && !error.message.includes(message))) {
      throw new Error(`${label}: expected ${Expected.name}${message ? ` containing ${message}` : ""}, received ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

function dossier(overrides: Record<string, unknown> = {}) {
  return {
    id: registrationId,
    parentId,
    periodId: "period-1",
    status: "verification",
    dossierReviewStatus: "pending",
    documents: basicDocumentTypes.map((type) => ({ type })),
    period: { unitId, educationLevel: "sd" },
    observationBooking: null,
    ...overrides,
  };
}

function reviewService(registration: Record<string, unknown>, updates: Record<string, unknown>[]) {
  const prisma: any = {
    registration: {
      findUnique: async () => registration,
      update: async ({ data }: any) => {
        updates.push(data);
        return { ...registration, ...data };
      },
    },
    registrationEvent: { create: async ({ data }: any) => data },
  };
  prisma.$transaction = async (operation: any) => typeof operation === "function" ? operation(prisma) : Promise.all(operation);
  return new RegistrationsService(prisma);
}

async function run() {
  await expectRejects(
    "foreign-unit staff cannot review",
    () => reviewService(dossier(), []).verifyDocuments(registrationId, {
      id: "foreign-staff",
      roles: [{ app: "spmb", role: "admin_unit", unitId: "other-unit" }],
    }, true),
    ForbiddenException,
  );

  await expectRejects(
    "initial approval requires every basic document",
    () => reviewService(dossier({ documents: basicDocumentTypes.slice(0, -1).map((type) => ({ type })) }), []).verifyDocuments(registrationId, staff, true),
    BadRequestException,
    "Dokumen wajib belum lengkap",
  );

  const approvedUpdates: Record<string, unknown>[] = [];
  const approved = await reviewService(dossier(), approvedUpdates).verifyDocuments(registrationId, staff, true);
  if (approvedUpdates.length !== 1 || approvedUpdates[0].status !== "medical_pending" || approvedUpdates[0].dossierReviewStatus !== "approved") {
    throw new Error("basic dossier approval must advance the parent to the medical stage");
  }
  if ((approved as any).nextStage !== "medical_pending" || (approved as any).dossierReviewStatus !== "approved") {
    throw new Error("basic approval response must expose medical_pending as the next stage");
  }

  await expectRejects(
    "rejection requires a meaningful revision reason",
    () => reviewService(dossier(), []).verifyDocuments(registrationId, staff, false, "  "),
    BadRequestException,
    "minimal 3 karakter",
  );

  const rejectedUpdates: Record<string, unknown>[] = [];
  const rejected = await reviewService(dossier(), rejectedUpdates).verifyDocuments(registrationId, staff, false, "Foto murid perlu diperjelas");
  if (rejectedUpdates.length !== 1 || rejectedUpdates[0].status !== "documents_uploaded" || rejectedUpdates[0].dossierReviewStatus !== "revision_required") {
    throw new Error("rejection must persist revision_required and return the documents stage");
  }
  if ((rejected as any).nextStage !== "documents_uploaded") {
    throw new Error("rejection response must tell the parent to resume at documents_uploaded");
  }

  const medicalApprovalUpdates: Record<string, unknown>[] = [];
  const medicalApproval = await reviewService(dossier({ documents: allDocumentTypes.map((type) => ({ type })) }), medicalApprovalUpdates).verifyDocuments(registrationId, staff, true);
  if (medicalApprovalUpdates.length !== 1 || medicalApprovalUpdates[0].status !== "verification" || medicalApprovalUpdates[0].dossierReviewStatus !== "approved") {
    throw new Error("medical evidence approval must unlock observation from verification");
  }
  if ((medicalApproval as any).nextStage !== "verification") {
    throw new Error("medical evidence approval response must preserve verification for observation booking");
  }

  const medicalRejectionUpdates: Record<string, unknown>[] = [];
  const medicalRejection = await reviewService(dossier({ documents: allDocumentTypes.map((type) => ({ type })) }), medicalRejectionUpdates).verifyDocuments(registrationId, staff, false, "Mohon unggah ulang hasil IMC yang terbaca.");
  if (medicalRejectionUpdates.length !== 1 || medicalRejectionUpdates[0].status !== "medical_pending" || medicalRejectionUpdates[0].dossierReviewStatus !== "revision_required") {
    throw new Error("medical evidence revision must return only to the medical stage");
  }
  if ((medicalRejection as any).nextStage !== "medical_pending") {
    throw new Error("medical evidence revision response must direct the parent to medical_pending");
  }

  const booking = new ObservationsService({
    $transaction: async (callback: any) => callback({
      registration: {
        findUnique: async () => dossier({ dossierReviewStatus: "approved" }),
        update: async () => ({}),
      },
      observationSchedule: {
        findUnique: async () => ({ id: "schedule-1", periodId: "period-1", quota: 1, booked: 0, date: new Date(), startTime: "08:00" }),
        updateMany: async () => ({ count: 1 }),
      },
      observationBooking: { create: async () => ({}) },
      registrationEvent: { create: async () => ({}) },
    }),
  } as any);
  await booking.bookSchedule(parentId, { registrationId, observationScheduleId: "schedule-1" });

  const pendingBooking = new ObservationsService({
    $transaction: async (callback: any) => callback({
      registration: { findUnique: async () => dossier({ dossierReviewStatus: "pending" }) },
      observationSchedule: { findUnique: async () => { throw new Error("unapproved dossier must not reach schedule lookup"); } },
    }),
  } as any);
  await expectRejects(
    "parent cannot book observation before persisted approval",
    () => pendingBooking.bookSchedule(parentId, { registrationId, observationScheduleId: "schedule-1" }),
    BadRequestException,
    "menunggu verifikasi",
  );

  console.log("SPMB dossier review contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
