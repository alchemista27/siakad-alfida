import assert from "node:assert/strict";
import { ConflictException, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { AdmissionHandoffService } from "../src/admission-handoff/admission-handoff.service";

function makeMockPrisma(state: { receipts: any[]; students: any[]; enrollments: any[] }) {
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
        const item = { id: `rcp-${state.receipts.length + 1}`, ...args.data };
        state.receipts.push(item);
        return item;
      },
      update: async (args: any) => {
        const idx = state.receipts.findIndex((r) => r.id === args.where.id);
        state.receipts[idx] = { ...state.receipts[idx], ...args.data };
        return state.receipts[idx];
      },
    },
    student: {
      create: async (args: any) => {
        const item = { id: `std-${state.students.length + 1}`, ...args.data };
        state.students.push(item);
        return item;
      },
    },
    enrollment: {
      create: async (args: any) => {
        const item = { id: `enr-${state.enrollments.length + 1}`, ...args.data };
        state.enrollments.push(item);
        return item;
      },
    },
    $transaction: async (cb: any) => {
      return cb(client);
    },
  };
  return client;
}

async function main() {
  const state = {
    receipts: [] as any[],
    students: [] as any[],
    enrollments: [] as any[],
  };

  const prisma = makeMockPrisma(state);
  const service = new AdmissionHandoffService(prisma);

  const validPayload = {
    spmbRegistrationId: "a0000000-0000-0000-0000-000000000001",
    registrationNumber: "SPMB-2026-001",
    unitId: "u0000000-0000-0000-0000-000000000001",
    academicYearId: "y0000000-0000-0000-0000-000000000001",
    student: {
      fullName: "Fulan bin Fulan",
      gender: "male" as const,
      birthPlace: "Jakarta",
      birthDate: "2012-05-10",
      address: "Jl. Kebahagiaan No. 1",
    },
    parent: {
      userId: "p0000000-0000-0000-0000-000000000001",
      fullName: "Ayah Fulan",
      email: "ayah@example.com",
      phone: "08123456789",
    },
    idempotencyKey: "handoff:a0000000-0000-0000-0000-000000000001:accepted",
  };

  // 1. First reception succeeds
  const res1 = await service.receiveAdmissionHandoff(validPayload);
  assert.equal(res1.status, "processed");
  assert.equal(state.receipts.length, 1);
  assert.equal(state.students.length, 1);
  assert.equal(state.enrollments.length, 1);
  assert.equal(state.enrollments[0].status, "pending_placement");

  // 2. Re-sending identical payload returns existing processed receipt idempotently
  const res2 = await service.receiveAdmissionHandoff(validPayload);
  assert.equal(res2.status, "processed");
  assert.equal(state.receipts.length, 1);
  assert.equal(state.students.length, 1);

  // 3. Different idempotencyKey but duplicate spmbRegistrationId throws ConflictException
  await assert.rejects(
    () =>
      service.receiveAdmissionHandoff({
        ...validPayload,
        idempotencyKey: "handoff:different-key",
      }),
    ConflictException,
  );

  console.log("SIAKAD handoff receiver contract passed");
}

void main();
