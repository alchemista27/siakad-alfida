import {
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { DecisionsService } from "../src/decisions/decisions.service";
import { HandoffService } from "../src/handoff/handoff.service";
import {
  SpmbHandoffPayloadSchema,
  SpmbHandoffReceiptSchema,
  type SpmbHandoffReceipt,
} from "@alfida/contracts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const originalUrl = process.env.INTERNAL_SIAKAD_API_URL;
const originalSecret = process.env.INTERNAL_SERVICE_SECRET;
const originalFetch = globalThis.fetch;

const unitId = "11111111-1111-4111-8111-111111111111";
const periodId = "22222222-2222-4222-8222-222222222222";
const registrationId = "33333333-3333-4333-8333-333333333333";
const parentId = "44444444-4444-4444-8444-444444444444";
const studentId = "55555555-5555-4555-8555-555555555555";
const destinationEnrollmentId = "66666666-6666-4666-8666-666666666666";
const receiptId = "receipt-uuid-7777-8888";

const principal = {
  id: "admin-unit-1",
  roles: [{ app: "spmb", role: "admin_unit", unitId }],
};

function createMockHarness() {
  const period = {
    id: periodId,
    unitId,
    unitSlug: "sdit-1",
    unitName: "SDIT Alfida",
    label: "2026/2027",
    sourceAcademicYearId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    isOpen: true,
  };

  const parent = {
    id: parentId,
    fullName: "Budi Santoso",
    email: "budi@example.test",
    phone: "08123456789",
  };

  const studentData = {
    id: studentId,
    fullName: "Ahmad Santoso",
    nickname: "Ahmad",
    gender: "male",
    birthPlace: "Jakarta",
    birthDate: new Date("2018-05-10T00:00:00.000Z"),
    nisn: "0012345678",
    address: "Jl. Alfida No. 10",
  };

  let registration: any = {
    id: registrationId,
    registrationNumber: "PPDB-SDIT-2026-0001",
    periodId,
    status: "observation_done",
    handoffStatus: "pending",
    handoffError: null,
    parentId,
    period,
    parent,
    studentData,
    parentData: [],
  };

  let outboxItem: any = null;
  const events: any[] = [];

  const client: any = {
    admissionPeriod: {
      findUnique: async () => ({ ...period }),
    },
    registration: {
      findUnique: async () => ({ ...registration, period, parent, studentData }),
      update: async ({ where, data }: any) => {
        registration = { ...registration, ...data };
        return { ...registration };
      },
    },
    handoffOutbox: {
      findUnique: async () => (outboxItem ? { ...outboxItem } : null),
      create: async ({ data }: any) => {
        outboxItem = { id: "outbox-1", ...data };
        return { ...outboxItem };
      },
      upsert: async ({ where, create, update }: any) => {
        if (!outboxItem) {
          outboxItem = { id: "outbox-1", ...create };
        } else {
          outboxItem = { ...outboxItem, ...update };
        }
        return { ...outboxItem };
      },
      update: async ({ where, data }: any) => {
        if (!outboxItem) throw new Error("outbox not found");
        outboxItem = {
          ...outboxItem,
          ...data,
          attempts:
            data.attempts?.increment !== undefined
              ? (outboxItem.attempts || 0) + data.attempts.increment
              : data.attempts !== undefined
                ? data.attempts
                : outboxItem.attempts,
        };
        return { ...outboxItem };
      },
    },
    registrationEvent: {
      create: async ({ data }: any) => {
        events.push(data);
        return { id: `ev-${events.length}`, ...data };
      },
    },
    admissionPeriodCounter: {
      update: async () => ({}),
    },
  };

  client.$transaction = async (callback: any) => {
    return callback(client);
  };

  return {
    client,
    getRegistration: () => ({ ...registration }),
    getOutbox: () => (outboxItem ? { ...outboxItem } : null),
    getEvents: () => [...events],
  };
}

async function run() {
  process.env.INTERNAL_SIAKAD_API_URL = "https://siakad.example.test";
  process.env.INTERNAL_SERVICE_SECRET = "secret-handoff-key";

  try {
    const harness = createMockHarness();
    const decisionsService = new DecisionsService(harness.client);
    const handoffService = new HandoffService(harness.client);

    // 1. Accepted decision creates one immutable outbox item in the same transaction
    await decisionsService.setSingleDecision(principal as any, {
      registrationId,
      status: "accepted",
      notes: "Pendaftar dinyatakan diterima",
    });

    const regAfterDecision = harness.getRegistration();
    assert(regAfterDecision.status === "accepted", "decision must set registration status to accepted");
    const outboxAfterDecision = harness.getOutbox();
    assert(outboxAfterDecision, "accepted decision must create an outbox item");
    assert(outboxAfterDecision.status === "pending", "initial outbox item status must be pending");
    assert(outboxAfterDecision.attempts === 0, "initial outbox item attempts must be 0");
    assert(typeof outboxAfterDecision.idempotencyKey === "string", "outbox must have idempotencyKey");
    assert(typeof outboxAfterDecision.payloadHash === "string", "outbox must have payloadHash");

    const originalIdempotencyKey = outboxAfterDecision.idempotencyKey;
    const originalPayloadHash = outboxAfterDecision.payloadHash;

    // 2. Retry decision reuses the same idempotency key and payload hash
    await decisionsService.setSingleDecision(principal as any, {
      registrationId,
      status: "accepted",
      notes: "Pendaftar dinyatakan diterima (retry)",
    });

    const outboxAfterRetry = harness.getOutbox();
    assert(
      outboxAfterRetry.idempotencyKey === originalIdempotencyKey,
      "retry must preserve existing immutable idempotencyKey",
    );
    assert(
      outboxAfterRetry.payloadHash === originalPayloadHash,
      "retry must preserve existing payloadHash",
    );

    // 3. Network failure records retry metadata but DOES NOT set registration to enrolled
    let outgoingPayload: any = null;
    globalThis.fetch = (async (url: any, init: any) => {
      outgoingPayload = JSON.parse(init.body);
      return new Response("Internal Server Error in SIAKAD", { status: 500 });
    }) as typeof fetch;

    const failResult = await handoffService.deliverOutbox(registrationId);
    assert(failResult.success === false, "delivery must report failure on 500 error");

    // Verify payload schema adherence
    assert(outgoingPayload, "delivery must send payload");
    assert(outgoingPayload.idempotencyKey === originalIdempotencyKey, "payload must reuse outbox idempotencyKey");
    SpmbHandoffPayloadSchema.parse(outgoingPayload); // Must validate against shared contract schema!

    const outboxAfterFail = harness.getOutbox();
    assert(outboxAfterFail.attempts === 1, `attempts must increment to 1, got ${outboxAfterFail.attempts}`);
    assert(outboxAfterFail.status === "failed", "outbox status must be failed after error");
    assert(outboxAfterFail.lastError.includes("500"), "lastError must record failure reason");

    const regAfterFail = harness.getRegistration();
    assert(regAfterFail.status === "accepted", "registration status MUST NOT change to enrolled on network failure");
    assert(regAfterFail.handoffStatus === "failed", "registration handoffStatus must be failed");

    // 4. Only a validated destination receipt completes delivery
    // 4a. Destination returns invalid receipt -> must not complete delivery
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ receiptId: "invalid-receipt" }), { status: 200 });
    }) as typeof fetch;

    const invalidReceiptResult = await handoffService.deliverOutbox(registrationId);
    assert(invalidReceiptResult.success === false, "invalid receipt must not succeed");
    const outboxAfterInvalid = harness.getOutbox();
    assert(outboxAfterInvalid.status === "failed", "outbox status must remain failed on invalid receipt");

    // 4b. Destination returns valid receipt conforming to SpmbHandoffReceiptSchema
    const validReceipt: SpmbHandoffReceipt = {
      receiptId,
      sourceRegistrationId: registrationId,
      destinationEnrollmentId,
      status: "accepted",
    };

    globalThis.fetch = (async () => {
      return new Response(JSON.stringify(validReceipt), { status: 200 });
    }) as typeof fetch;

    const validResult = await handoffService.deliverOutbox(registrationId);
    assert(validResult.success === true, "delivery must succeed with valid receipt");

    const outboxAfterSuccess = harness.getOutbox();
    assert(outboxAfterSuccess.status === "delivered", "outbox status must be delivered");
    assert(outboxAfterSuccess.deliveredAt instanceof Date, "outbox deliveredAt must be recorded");
    assert(
      outboxAfterSuccess.destinationEnrollmentId === destinationEnrollmentId,
      "destinationEnrollmentId must be recorded in outbox",
    );

    const regAfterSuccess = harness.getRegistration();
    assert(regAfterSuccess.handoffStatus === "done", "registration handoffStatus must be done");
    assert(regAfterSuccess.status === "accepted", "registration status must STILL be accepted (not enrolled)");

    // 5. accepted → enrolled occurs ONLY on an authenticated enrollment confirmation
    // 5a. Unauthenticated or wrong secret key fails closed
    try {
      await handoffService.confirmEnrollment(validReceipt, "wrong-key");
      throw new Error("confirmEnrollment without valid secret key unexpectedly succeeded");
    } catch (err: any) {
      assert(
        err instanceof UnauthorizedException,
        `confirmEnrollment with wrong secret must throw UnauthorizedException, got ${err}`,
      );
    }

    // 5b. Authenticated enrollment confirmation transitions status to enrolled
    const confirmResult = await handoffService.confirmEnrollment(
      validReceipt,
      process.env.INTERNAL_SERVICE_SECRET,
    );
    assert(confirmResult.success === true, "authenticated confirmEnrollment must succeed");
    assert(confirmResult.status === "enrolled", "confirmEnrollment must return enrolled status");

    const regAfterEnrolled = harness.getRegistration();
    assert(regAfterEnrolled.status === "enrolled", "registration status must transition to enrolled");

    const enrollmentEvents = harness.getEvents().filter((e) => e.toStatus === "enrolled" && e.kind === "enrollment");
    assert(enrollmentEvents.length === 1, "enrollment event must be logged in registration event trail");

    console.log("SPMB handoff outbox contract passed");
  } finally {
    if (originalUrl === undefined) delete process.env.INTERNAL_SIAKAD_API_URL;
    else process.env.INTERNAL_SIAKAD_API_URL = originalUrl;
    if (originalSecret === undefined) delete process.env.INTERNAL_SERVICE_SECRET;
    else process.env.INTERNAL_SERVICE_SECRET = originalSecret;
    globalThis.fetch = originalFetch;
  }
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
