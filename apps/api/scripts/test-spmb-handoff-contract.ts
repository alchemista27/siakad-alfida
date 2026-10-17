import assert from 'node:assert/strict';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InternalController } from '../src/internal/internal.controller';
import { InternalService } from '../src/internal/internal.service';

async function expectRejects(
  action: () => Promise<unknown>,
  expectedType: new (...args: any[]) => Error,
): Promise<void> {
  await assert.rejects(action, expectedType);
}

async function run(): Promise<void> {
  const originalSecret = process.env.INTERNAL_SERVICE_SECRET;
  delete process.env.INTERNAL_SERVICE_SECRET;

  let handoffCalled = false;
  const controller = new InternalController({
    handoffSpmb: async () => {
      handoffCalled = true;
      return {};
    },
    getUnits: async () => [],
  } as any);

  try {
    await expectRejects(
      () => controller.handleSpmbHandoff('simalfida-internal-secret-2026', {}),
      InternalServerErrorException,
    );
    assert.equal(handoffCalled, false, 'handoff must not run without an explicitly configured secret');

    process.env.INTERNAL_SERVICE_SECRET = '   ';
    await expectRejects(
      () => controller.handleSpmbHandoff('   ', {}),
      InternalServerErrorException,
    );
    assert.equal(handoffCalled, false, 'handoff must not run with a malformed secret configuration');
  } finally {
    if (originalSecret === undefined) delete process.env.INTERNAL_SERVICE_SECRET;
    else process.env.INTERNAL_SERVICE_SECRET = originalSecret;
  }

  let transactionCalls = 0;
  const service = new InternalService({
    $transaction: async () => {
      transactionCalls += 1;
      throw new Error('validation must run before a database transaction');
    },
  } as any);

  await expectRejects(
    () =>
      service.handoffSpmb({
        registrationNumber: 'REG-001',
        unitId: '3b33a525-89ca-4727-8a9a-6efc3bd319a6',
        user: { email: 'parent@example.test' },
        student: {
          fullName: 'Student Name',
          gender: 'male',
          birthPlace: 'Bandung',
          birthDate: '2018-01-01T00:00:00.000Z',
          address: 'Jl. Contoh 1',
        },
      }),
    BadRequestException,
  );
  assert.equal(transactionCalls, 0, 'a handoff without a stable parent id must not start a transaction');

  await expectRejects(
    () =>
      service.handoffSpmb({
        registrationNumber: 'REG-INVALID-ID',
        unitId: '3b33a525-89ca-4727-8a9a-6efc3bd319a6',
        user: { id: 'unstable-id', email: 'parent@example.test' },
        student: {
          fullName: 'Student Name',
          gender: 'male',
          birthPlace: 'Bandung',
          birthDate: '2018-01-01T00:00:00.000Z',
          address: 'Jl. Contoh 1',
        },
      }),
    BadRequestException,
  );
  assert.equal(transactionCalls, 0, 'a handoff without a UUID parent id must not start a transaction');

  await expectRejects(
    () =>
      service.handoffSpmb({
        registrationNumber: 'REG-002',
        unitId: '3b33a525-89ca-4727-8a9a-6efc3bd319a6',
        user: { id: 'bc41bbce-37e5-4b9e-82ba-4138a9c5dba8', email: 'not-an-email' },
        student: {
          fullName: 'Student Name',
          gender: 'male',
          birthPlace: 'Bandung',
          birthDate: '2018-01-01T00:00:00.000Z',
          address: 'Jl. Contoh 1',
        },
      }),
    BadRequestException,
  );
  assert.equal(transactionCalls, 0, 'a handoff with an invalid parent email must not start a transaction');

  const invalidStudents = [
    { label: 'student object', student: null },
    {
      label: 'student full name',
      student: {
        fullName: ' ',
        gender: 'male',
        birthPlace: 'Bandung',
        birthDate: '2018-01-01T00:00:00.000Z',
        address: 'Jl. Contoh 1',
      },
    },
    {
      label: 'student gender',
      student: {
        fullName: 'Student Name',
        gender: 'other',
        birthPlace: 'Bandung',
        birthDate: '2018-01-01T00:00:00.000Z',
        address: 'Jl. Contoh 1',
      },
    },
    {
      label: 'student birth place',
      student: {
        fullName: 'Student Name',
        gender: 'male',
        birthPlace: '',
        birthDate: '2018-01-01T00:00:00.000Z',
        address: 'Jl. Contoh 1',
      },
    },
    {
      label: 'student birth date',
      student: {
        fullName: 'Student Name',
        gender: 'male',
        birthPlace: 'Bandung',
        birthDate: 'not-a-date',
        address: 'Jl. Contoh 1',
      },
    },
    {
      label: 'student address',
      student: {
        fullName: 'Student Name',
        gender: 'male',
        birthPlace: 'Bandung',
        birthDate: '2018-01-01T00:00:00.000Z',
        address: ' ',
      },
    },
  ];

  for (const { label, student } of invalidStudents) {
    await expectRejects(
      () =>
        service.handoffSpmb({
          registrationNumber: 'REG-STUDENT',
          unitId: '3b33a525-89ca-4727-8a9a-6efc3bd319a6',
          user: { id: 'bc41bbce-37e5-4b9e-82ba-4138a9c5dba8', email: 'parent@example.test' },
          student,
        }),
      BadRequestException,
    );
    assert.equal(transactionCalls, 0, `a handoff with an invalid ${label} must not start a transaction`);
  }

  const academicYearQueries: unknown[] = [];
  const noActiveYearService = new InternalService({
    $transaction: async (callback: (tx: any) => Promise<unknown>) =>
      callback({
        user: { findUnique: async () => ({ id: 'b6c9551b-6ef4-4c59-8693-2c17a90621a1' }) },
        academicYear: {
          findFirst: async (query: unknown) => {
            academicYearQueries.push(query);
            return null;
          },
        },
      }),
  } as any);

  await expectRejects(
    () =>
      noActiveYearService.handoffSpmb({
        registrationNumber: 'REG-NO-ACTIVE-YEAR',
        unitId: '3b33a525-89ca-4727-8a9a-6efc3bd319a6',
        user: { id: 'bc41bbce-37e5-4b9e-82ba-4138a9c5dba8', email: 'parent@example.test' },
        student: {
          fullName: 'Student Name',
          gender: 'male',
          birthPlace: 'Bandung',
          birthDate: '2018-01-01T00:00:00.000Z',
          address: 'Jl. Contoh 1',
        },
      }),
    NotFoundException,
  );
  assert.deepEqual(academicYearQueries, [
    { where: { unitId: '3b33a525-89ca-4727-8a9a-6efc3bd319a6', ppdbActive: true } },
  ]);

  const registrationUpserts: any[] = [];
  const successfulHandoffService = new InternalService({
    $transaction: async (callback: (tx: any) => Promise<unknown>) =>
      callback({
        user: { findUnique: async () => ({ id: 'b6c9551b-6ef4-4c59-8693-2c17a90621a1' }) },
        academicYear: { findFirst: async () => ({ id: '7c4621f0-0912-4377-8741-15df2c77ca81' }) },
        registration: {
          upsert: async (query: unknown) => {
            registrationUpserts.push(query);
            return {
              id: '189e3ecc-a07d-4ab7-9baa-9d37cf2a2f22',
              registrationNumber: 'REG-IDEMPOTENT',
            };
          },
        },
        studentData: { upsert: async () => ({}) },
      }),
  } as any);

  const successfulHandoff = await successfulHandoffService.handoffSpmb({
    registrationNumber: 'REG-IDEMPOTENT',
    unitId: '3b33a525-89ca-4727-8a9a-6efc3bd319a6',
    user: { id: 'bc41bbce-37e5-4b9e-82ba-4138a9c5dba8', email: 'parent@example.test' },
    student: {
      fullName: 'Student Name',
      gender: 'male',
      birthPlace: 'Bandung',
      birthDate: '2018-01-01T00:00:00.000Z',
      address: 'Jl. Contoh 1',
    },
  });
  assert.equal(successfulHandoff.success, true);
  assert.equal((successfulHandoff as any).destinationRegistrationId, '189e3ecc-a07d-4ab7-9baa-9d37cf2a2f22');
  assert.deepEqual(registrationUpserts.map((query) => query.where), [
    { registrationNumber: 'REG-IDEMPOTENT' },
  ]);

  const createdParentPasswordHashes: string[] = [];
  const parentCreationService = new InternalService({
    $transaction: async (callback: (tx: any) => Promise<unknown>) =>
      callback({
        user: {
          findUnique: async () => null,
          create: async ({ data }: any) => {
            createdParentPasswordHashes.push(data.passwordHash);
            return { id: data.id };
          },
        },
        academicYear: { findFirst: async () => ({ id: '7c4621f0-0912-4377-8741-15df2c77ca81' }) },
        registration: {
          upsert: async ({ where }: any) => ({
            id: '189e3ecc-a07d-4ab7-9baa-9d37cf2a2f22',
            registrationNumber: where.registrationNumber,
          }),
        },
        studentData: { upsert: async () => ({}) },
      }),
  } as any);

  for (const [id, email, registrationNumber] of [
    ['bc41bbce-37e5-4b9e-82ba-4138a9c5dba8', 'new-parent-1@example.test', 'REG-NEW-PARENT-1'],
    ['b6c9551b-6ef4-4c59-8693-2c17a90621a1', 'new-parent-2@example.test', 'REG-NEW-PARENT-2'],
  ]) {
    await parentCreationService.handoffSpmb({
      registrationNumber,
      unitId: '3b33a525-89ca-4727-8a9a-6efc3bd319a6',
      user: { id, email },
      student: {
        fullName: 'Student Name',
        gender: 'male',
        birthPlace: 'Bandung',
        birthDate: '2018-01-01T00:00:00.000Z',
        address: 'Jl. Contoh 1',
      },
    });
  }
  assert.equal(createdParentPasswordHashes.length, 2);
  assert.notEqual(
    createdParentPasswordHashes[0],
    createdParentPasswordHashes[1],
    'new parent accounts must not receive a shared default credential',
  );
}

run()
  .then(() => console.log('SPMB handoff contract: PASS'))
  .catch((error) => {
    console.error('SPMB handoff contract: FAIL');
    console.error(error);
    process.exitCode = 1;
  });
