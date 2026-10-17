import { ConflictException, BadRequestException } from "@nestjs/common";
import {
  deriveStatusFromManifest,
  buildManifestEventTrail,
  type BackfillManifest,
} from "../src/imports/backfill-manifest.policy";
import { RegistrationsService } from "../src/registrations/registrations.service";
import { ImportsService } from "../src/imports/imports.service";
import { AdmissionCapacityService } from "../src/registrations/admission-capacity.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const mockPrincipal = {
  id: "staff-1",
  roles: [{ app: "spmb", role: "admin_unit", unitId: "u-1" }],
};

const fullManifest: BackfillManifest = {
  payment: { verified: true, paidAt: "2026-05-01T10:00:00.000Z", amount: 250000 },
  student: {
    fullName: "Ahmad Dahlan",
    gender: "male",
    birthPlace: "Yogyakarta",
    birthDate: "2018-08-01T00:00:00.000Z",
    address: "Jl. Kauman No. 1",
  },
  documents: [
    { type: "photo", objectKey: "photo.jpg", fileName: "photo.jpg", mimeType: "image/jpeg", fileSize: 1024 },
    { type: "birth_certificate", objectKey: "akta.pdf", fileName: "akta.pdf", mimeType: "application/pdf", fileSize: 2048 },
    { type: "family_card", objectKey: "kk.pdf", fileName: "kk.pdf", mimeType: "application/pdf", fileSize: 2048 },
    { type: "father_id", objectKey: "ktp-ayah.jpg", fileName: "ktp-ayah.jpg", mimeType: "image/jpeg", fileSize: 1024 },
    { type: "mother_id", objectKey: "ktp-ibu.jpg", fileName: "ktp-ibu.jpg", mimeType: "image/jpeg", fileSize: 1024 },
  ],
  medical: { objectKey: "medical-checkup.pdf", referralNumber: "MED-001" },
  observation: { scheduleId: "sch-1", score: 92, notes: "Sangat baik", observerId: "obs-1" },
  decision: { status: "accepted", note: "Lulus seleksi observasi dan wawancara" },
};

function createMockRepository(initialState?: {
  quota?: number;
  initialCounter?: number;
  existingRegistrations?: any[];
}) {
  const period = {
    id: "p-1",
    unitId: "u-1",
    unitSlug: "sdit-1",
    unitName: "SDIT Alfida",
    label: "2026/2027",
    isOpen: true,
    quota: initialState?.quota ?? 10,
    fee: 250000,
  };

  const counters = new Map<string, any>();
  if (initialState?.initialCounter !== undefined) {
    counters.set("p-1", {
      periodId: "p-1",
      nextSequence: initialState.initialCounter + 1,
      intakeReserved: initialState.initialCounter,
      acceptedCount: 0,
    });
  }

  const registrations: any[] = [...(initialState?.existingRegistrations ?? [])];
  const events: any[] = [];
  const payments: any[] = [];
  const students: any[] = [];
  const observationResults: any[] = [];
  const documents: any[] = [];

  const client: any = {
    admissionPeriod: {
      findUnique: async ({ where }: any) => {
        if (where.id === period.id) return { ...period };
        return null;
      },
    },
    admissionPeriodCounter: {
      findUnique: async ({ where }: any) => {
        const found = counters.get(where.periodId);
        return found ? { ...found } : null;
      },
      create: async ({ data }: any) => {
        const copy = { ...data };
        counters.set(data.periodId, copy);
        return copy;
      },
      update: async ({ where, data }: any) => {
        const cur = counters.get(where.periodId) || {};
        const updated = {
          ...cur,
          nextSequence: data.nextSequence !== undefined ? data.nextSequence : cur.nextSequence,
          intakeReserved: data.intakeReserved !== undefined ? data.intakeReserved : cur.intakeReserved,
          acceptedCount: data.acceptedCount !== undefined ? data.acceptedCount : cur.acceptedCount,
        };
        counters.set(where.periodId, updated);
        return updated;
      },
    },
    registration: {
      findUnique: async ({ where }: any) => {
        if (where.id) return registrations.find((r) => r.id === where.id) ?? null;
        if (where.periodId_externalRef) {
          return (
            registrations.find(
              (r) =>
                r.periodId === where.periodId_externalRef.periodId &&
                r.externalRef === where.periodId_externalRef.externalRef,
            ) ?? null
          );
        }
        return null;
      },
      count: async ({ where }: any) => {
        return registrations.filter((r) => r.periodId === where.periodId).length;
      },
      create: async ({ data }: any) => {
        const reg = { id: `reg-${registrations.length + 1}`, ...data };
        registrations.push(reg);
        return reg;
      },
    },
    studentData: {
      create: async ({ data }: any) => {
        students.push(data);
        return { id: `std-${students.length}`, ...data };
      },
    },
    payment: {
      create: async ({ data }: any) => {
        payments.push(data);
        return { id: `pay-${payments.length}`, ...data };
      },
    },
    observationResult: {
      create: async ({ data }: any) => {
        observationResults.push(data);
        return { id: `obs-${observationResults.length}`, ...data };
      },
    },
    document: {
      create: async ({ data }: any) => {
        documents.push(data);
        return { id: `doc-${documents.length}`, ...data };
      },
    },
    registrationEvent: {
      create: async ({ data }: any) => {
        events.push(data);
        return { id: `ev-${events.length}`, ...data };
      },
    },
  };

  client.$transaction = async (callback: any) => {
    return callback(client);
  };

  return { client, counters, registrations, events, payments, students, observationResults, documents };
}

async function run() {
  // 1. Evidence manifest derivation tests
  assert(deriveStatusFromManifest(undefined) === "pending_payment", "missing manifest must be pending_payment");
  assert(
    deriveStatusFromManifest({ payment: { verified: false } }) === "pending_payment",
    "unverified payment must be pending_payment",
  );
  assert(
    deriveStatusFromManifest({ payment: { verified: true } }) === "payment_verified",
    "verified payment without student data must be payment_verified",
  );
  assert(
    deriveStatusFromManifest({
      payment: { verified: true },
      student: fullManifest.student,
    }) === "form_filling",
    "verified payment with student data but no docs must be form_filling",
  );
  assert(
    deriveStatusFromManifest({
      payment: { verified: true },
      student: fullManifest.student,
      documents: fullManifest.documents,
    }) === "documents_uploaded",
    "complete docs without medical must be documents_uploaded",
  );
  assert(
    deriveStatusFromManifest({
      payment: { verified: true },
      student: fullManifest.student,
      documents: fullManifest.documents,
      medical: fullManifest.medical,
    }) === "verification",
    "complete docs with medical must be verification",
  );
  assert(
    deriveStatusFromManifest({
      payment: { verified: true },
      student: fullManifest.student,
      documents: fullManifest.documents,
      medical: fullManifest.medical,
      observation: fullManifest.observation,
    }) === "observation_done",
    "complete observation evidence must be observation_done",
  );
  assert(
    deriveStatusFromManifest(fullManifest) === "accepted",
    "full evidence with accepted decision must be accepted",
  );
  assert(
    deriveStatusFromManifest({ ...fullManifest, decision: { status: "rejected", note: "Tidak memenuhi syarat" } }) ===
      "rejected",
    "full evidence with rejected decision must be rejected",
  );
  // Malformed jump attempt: decision given without observation or docs
  assert(
    deriveStatusFromManifest({
      payment: { verified: false },
      decision: { status: "accepted" },
    }) === "pending_payment",
    "arbitrary jump to accepted without verified payment must be prevented",
  );

  // 2. Offline registration service integration tests
  {
    // Arbitrary initialStatus must NOT be blindly accepted
    const harness = createMockRepository({ quota: 10 });
    const capacityService = new AdmissionCapacityService(harness.client);
    const regService = new RegistrationsService(harness.client, capacityService);

    const reg1 = await regService.createOffline(mockPrincipal.id, {
      periodId: "p-1",
      guardianName: "Budi",
      guardianPhone: "081234567890",
      initialStatus: "accepted" as any, // caller tries arbitrary accepted without evidence
    });
    assert(
      reg1.status === "pending_payment",
      `arbitrary initialStatus must be ignored, expected pending_payment, got ${reg1.status}`,
    );

    // Complete manifest must derive accepted and create full event trail
    const reg2 = await regService.createOffline(mockPrincipal.id, {
      periodId: "p-1",
      guardianName: "Budi",
      guardianPhone: "081234567890",
      manifest: fullManifest,
    });
    assert(reg2.status === "accepted", "complete manifest must result in accepted status");
    const reg2Events = harness.events.filter((e) => e.registrationId === reg2.id);
    assert(
      reg2Events.length === 7,
      `complete manifest must create complete event trail (7 events), got ${reg2Events.length}`,
    );
    assert(reg2Events[0].toStatus === "pending_payment", "first event must be pending_payment");
    assert(reg2Events[1].toStatus === "payment_verified", "second event must be payment_verified");
    assert(reg2Events[2].toStatus === "form_filling", "third event must be form_filling");
    assert(reg2Events[3].toStatus === "documents_uploaded", "fourth event must be documents_uploaded");
    assert(reg2Events[4].toStatus === "verification", "fifth event must be verification");
    assert(reg2Events[5].toStatus === "observation_done", "sixth event must be observation_done");
    assert(reg2Events[6].toStatus === "accepted", "seventh event must be accepted");

    // Duplicate externalRef test
    await regService.createOffline(mockPrincipal.id, {
      periodId: "p-1",
      externalRef: "REF-100",
      guardianName: "Parent 3",
      guardianPhone: "0811111111",
    });

    try {
      await regService.createOffline(mockPrincipal.id, {
        periodId: "p-1",
        externalRef: "REF-100",
        guardianName: "Parent 4",
        guardianPhone: "0822222222",
      });
      throw new Error("duplicate externalRef did not throw ConflictException");
    } catch (err) {
      assert(err instanceof ConflictException, "duplicate externalRef must throw ConflictException");
    }
  }

  // 3. Batch import workflow integration tests
  {
    const harness = createMockRepository({ quota: 3 });
    const capacityService = new AdmissionCapacityService(harness.client);
    const importService = new ImportsService(harness.client, capacityService);

    const importResult = await importService.commit(mockPrincipal as any, {
      periodId: "p-1",
      rows: [
        // Row 1: with arbitrary CSV status="accepted", no evidence -> derives pending_payment
        {
          externalRef: "IMP-001",
          studentName: "Santri 1",
          gender: "male",
          guardianName: "Wali 1",
          guardianPhone: "08111111",
          status: "accepted", // arbitrary CSV status
        },
        // Row 2: with verified payment & complete evidence -> derives accepted
        {
          externalRef: "IMP-002",
          studentName: "Santri 2",
          gender: "female",
          guardianName: "Wali 2",
          guardianPhone: "08222222",
          manifest: fullManifest,
        },
        // Row 3: duplicate externalRef in same batch -> must be skipped/error
        {
          externalRef: "IMP-001",
          studentName: "Santri Duplikat",
          gender: "male",
          guardianName: "Wali Duplikat",
          guardianPhone: "08333333",
        },
      ],
    });

    assert(importResult.successCount === 2, `expected 2 successes, got ${importResult.successCount}`);
    assert(importResult.errorCount === 1, `expected 1 duplicate error, got ${importResult.errorCount}`);

    const reg1 = harness.registrations.find((r) => r.externalRef === "IMP-001");
    assert(reg1, "IMP-001 must be saved");
    assert(
      reg1.status === "pending_payment",
      `arbitrary CSV status must be ignored, expected pending_payment, got ${reg1.status}`,
    );

    const reg2 = harness.registrations.find((r) => r.externalRef === "IMP-002");
    assert(reg2, "IMP-002 must be saved");
    assert(reg2.status === "accepted", "manifest-backed row must derive accepted status");

    // Quota reached: attempting to import another row when quota=3 is exhausted
    const reg3 = await importService.commit(mockPrincipal as any, {
      periodId: "p-1",
      rows: [
        {
          externalRef: "IMP-003",
          studentName: "Santri 3",
          gender: "male",
          guardianName: "Wali 3",
          guardianPhone: "08444444",
        },
        // Row 4 exceeds quota (quota=3)
        {
          externalRef: "IMP-004",
          studentName: "Santri 4",
          gender: "female",
          guardianName: "Wali 4",
          guardianPhone: "08555555",
        },
      ],
    });

    assert(reg3.successCount === 1, `expected 1 success before quota exhausted, got ${reg3.successCount}`);
    assert(reg3.errorCount === 1, `expected 1 quota error, got ${reg3.errorCount}`);
    assert(
      reg3.errors[0].reason.toLowerCase().includes("kuota"),
      `expected quota error message, got: ${reg3.errors[0].reason}`,
    );
  }

  console.log("SPMB offline import workflow contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
