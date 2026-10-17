import assert from "node:assert/strict";
import {
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { SpmbHandoffReceiptSchema, type SpmbHandoffPayload } from "@alfida/contracts";
import { InternalController } from "../src/internal/internal.controller";
import { InternalService } from "../src/internal/internal.service";

function makeMockPrisma(state: {
  receipts: any[];
  students: any[];
  enrollments: any[];
  academicYears: any[];
  unitProjections: any[];
}) {
  const client: any = {
    admissionReceipt: {
      findUnique: async (args: any) => {
        if (args.where?.idempotencyKey) {
          return state.receipts.find((r) => r.idempotencyKey === args.where.idempotencyKey) ?? null;
        }
        if (args.where?.spmbRegistrationId) {
          return state.receipts.find((r) => r.spmbRegistrationId === args.where.spmbRegistrationId) ?? null;
        }
        return null;
      },
      create: async (args: any) => {
        const item = { id: `a1111111-0000-0000-0000-${String(state.receipts.length + 1).padStart(12, "0")}`, ...args.data };
        state.receipts.push(item);
        return item;
      },
    },
    student: {
      findFirst: async (args: any) => {
        if (args.where?.admissionReceiptId) {
          return state.students.find((s) => s.admissionReceiptId === args.where.admissionReceiptId) ?? null;
        }
        return null;
      },
      findUnique: async (args: any) => {
        if (args.where?.admissionReceiptId) {
          return state.students.find((s) => s.admissionReceiptId === args.where.admissionReceiptId) ?? null;
        }
        return null;
      },
      create: async (args: any) => {
        const item = { id: `b2222222-0000-0000-0000-${String(state.students.length + 1).padStart(12, "0")}`, ...args.data };
        state.students.push(item);
        return item;
      },
    },
    enrollment: {
      findFirst: async (args: any) => {
        if (args.where?.studentId) {
          return state.enrollments.find((e) => e.studentId === args.where.studentId) ?? null;
        }
        return null;
      },
      create: async (args: any) => {
        const item = { id: `c3333333-0000-0000-0000-${String(state.enrollments.length + 1).padStart(12, "0")}`, ...args.data };
        state.enrollments.push(item);
        return item;
      },
    },
    academicYear: {
      findFirst: async (args: any) => {
        if (args?.where?.id) {
          return state.academicYears.find((y) => y.id === args.where.id) ?? null;
        }
        if (args?.where?.unitId && args?.where?.status) {
          return (
            state.academicYears.find(
              (y) => y.unitId === args.where.unitId && y.status === args.where.status,
            ) ?? null
          );
        }
        return state.academicYears[0] ?? null;
      },
    },
    unitProjection: {
      findMany: async () => state.unitProjections,
    },
    $transaction: async (cb: any) => cb(client),
  };
  return client;
}

async function main() {
  const secretKey = "super-secret-internal-key-12345";
  process.env.INTERNAL_SERVICE_SECRET = secretKey;

  const state = {
    receipts: [] as any[],
    students: [] as any[],
    enrollments: [] as any[],
    academicYears: [
      {
        id: "d4444444-0000-0000-0000-000000000001",
        unitId: "e5555555-0000-0000-0000-000000000001",
        name: "2026/2027",
        status: "active",
      },
    ],
    unitProjections: [
      {
        id: "e5555555-0000-0000-0000-000000000001",
        name: "SMP Islam Alfida",
        slug: "smp-islam-alfida",
        status: "active",
      },
    ],
  };

  const prisma = makeMockPrisma(state);
  const service = new InternalService(prisma);
  const controller = new InternalController(service);

  const validPayload: SpmbHandoffPayload = {
    idempotencyKey: "11111111-1111-1111-1111-111111111111",
    spmbRegistrationId: "22222222-2222-2222-2222-222222222222",
    registrationNumber: "SPMB-2026-SMP-001",
    sourceAcademicYearId: "d4444444-0000-0000-0000-000000000001",
    unitId: "e5555555-0000-0000-0000-000000000001",
    parent: {
      id: "33333333-3333-3333-3333-333333333333",
      fullName: "Fulan bin Fulan Senior",
      email: "fulan.senior@example.com",
      phone: "081234567890",
    },
    student: {
      fullName: "Fulan Junior",
      gender: "male",
      birthPlace: "Jakarta",
      birthDate: "2013-08-17T00:00:00.000Z",
      nisn: "0012345678",
      address: "Jl. Pendidikan No. 12, Jakarta",
    },
  };

  // 1. Auth failure: Missing or invalid secret key
  await assert.rejects(
    () => controller.handleSpmbHandoff(undefined, undefined, validPayload),
    UnauthorizedException,
    "Missing secret key must throw UnauthorizedException",
  );

  await assert.rejects(
    () => controller.handleSpmbHandoff("wrong-secret-key", undefined, validPayload),
    UnauthorizedException,
    "Wrong secret key must throw UnauthorizedException",
  );

  // 2. Validation failure: Malformed payload
  await assert.rejects(
    () => controller.handleSpmbHandoff(secretKey, undefined, { invalid: "payload" }),
    BadRequestException,
    "Malformed payload must throw BadRequestException",
  );

  await assert.rejects(
    () =>
      controller.handleSpmbHandoff(secretKey, undefined, {
        ...validPayload,
        parent: { ...validPayload.parent, email: "invalid-email" },
      }),
    BadRequestException,
    "Invalid parent email must throw BadRequestException",
  );

  // 3. Successful handoff reception
  const receipt1 = await controller.handleSpmbHandoff(secretKey, undefined, validPayload);
  const parsedReceipt = SpmbHandoffReceiptSchema.safeParse(receipt1);
  assert(parsedReceipt.success, "Receipt must conform to SpmbHandoffReceiptSchema");
  assert.equal(receipt1.status, "accepted");
  assert.equal(receipt1.sourceRegistrationId, validPayload.spmbRegistrationId);
  assert.ok(receipt1.receiptId);
  assert.ok(receipt1.destinationEnrollmentId);

  assert.equal(state.receipts.length, 1);
  assert.equal(state.students.length, 1);
  assert.equal(state.enrollments.length, 1);
  assert.equal(state.enrollments[0].status, "pending_placement");

  // 4. Idempotency: Repeating the exact same handoff returns the identical receipt
  const receipt2 = await controller.handleSpmbHandoff(secretKey, undefined, validPayload);
  assert.equal(receipt2.status, "accepted");
  assert.equal(receipt2.receiptId, receipt1.receiptId);
  assert.equal(receipt2.destinationEnrollmentId, receipt1.destinationEnrollmentId);
  assert.equal(state.receipts.length, 1, "Idempotent retry must not create duplicate receipt");
  assert.equal(state.students.length, 1, "Idempotent retry must not create duplicate student");
  assert.equal(state.enrollments.length, 1, "Idempotent retry must not create duplicate enrollment");

  // 5. Conflict: Same registration ID with a different idempotencyKey throws ConflictException
  await assert.rejects(
    () =>
      controller.handleSpmbHandoff(secretKey, undefined, {
        ...validPayload,
        idempotencyKey: "99999999-9999-9999-9999-999999999999",
      }),
    ConflictException,
    "Same registration with different idempotency key must throw ConflictException",
  );

  // 6. Alternative header: x-internal-service-token also accepted
  const tokenPayload: SpmbHandoffPayload = {
    ...validPayload,
    idempotencyKey: "88888888-8888-8888-8888-888888888888",
    spmbRegistrationId: "77777777-7777-7777-7777-777777777777",
    registrationNumber: "SPMB-2026-SMP-002",
  };
  const tokenReceipt = await controller.handleSpmbHandoff(undefined, secretKey, tokenPayload);
  assert.equal(tokenReceipt.status, "accepted");
  assert.equal(state.receipts.length, 2);

  // 7. Get units endpoint
  const units = await controller.getUnits(secretKey, undefined);
  assert.equal(units.length, 1);
  assert.equal(units[0].name, "SMP Islam Alfida");

  await assert.rejects(
    () => controller.getUnits("wrong-key", undefined),
    UnauthorizedException,
    "getUnits with wrong key must throw UnauthorizedException",
  );

  console.log("SIAKAD SPMB internal handoff contract passed");
}

void main();
