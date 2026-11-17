import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { ExaminerAssignmentsService } from "../src/examiner-assignments/examiner-assignments.service";

const ids = {
  admin: "11111111-1111-4111-8111-111111111111",
  examiner: "22222222-2222-4222-8222-222222222222",
  unit: "33333333-3333-4333-8333-333333333333",
  assignment: "44444444-4444-4444-8444-444444444444",
};

const admin = { id: ids.admin, roles: [{ app: "siyaum", role: "admin_ymq" }] };
const outsider = { id: "55555555-5555-4555-8555-555555555555", roles: [] };

function createPrisma(options: { active?: unknown; assignment?: unknown } = {}) {
  const created: unknown[] = [];
  const updated: unknown[] = [];
  const prisma = {
    user: {
      findUnique: async ({ where }: any) => where.id === ids.examiner
        ? { id: ids.examiner, isActive: true, sourceUpdatedAt: new Date("2026-11-17T00:00:00.000Z") }
        : null,
      findFirst: async ({ where }: any) => where.unitId === ids.unit
        ? { unitName: "SD Islam Terpadu Iqra 1" }
        : null,
    },
    ymqExaminerAssignment: {
      findFirst: async () => options.active ?? null,
      create: async ({ data }: any) => {
        created.push(data);
        return { id: ids.assignment, ...data, examiner: { id: ids.examiner, fullName: "Penguji Satu", email: "penguji@example.test", unitId: ids.unit, unitName: "SD Islam Terpadu Iqra 1" } };
      },
      findMany: async () => options.assignment ? [options.assignment] : [],
      findFirstOrThrow: async () => options.assignment ?? (() => { throw new NotFoundException(); })(),
      update: async ({ data }: any) => {
        updated.push(data);
        return { id: ids.assignment, ...data };
      },
    },
  };
  return { prisma, created, updated };
}

async function main() {
  const successful = createPrisma();
  const service = new ExaminerAssignmentsService(successful.prisma as never);

  const created = await service.assign({
    academicYear: "2026/2027",
    examinerUserId: ids.examiner,
    target: "peserta",
    gender: "ikhwan",
    unitId: ids.unit,
    levels: ["tahfiz", "pra_tahsin", "tahsin", "tahsin"],
  }, admin);

  assert.equal(created.id, ids.assignment);
  assert.deepEqual(successful.created, [{
    examinerUserId: ids.examiner,
    academicYear: "2026/2027",
    target: "peserta",
    gender: "ikhwan",
    unitId: ids.unit,
    unitName: "SD Islam Terpadu Iqra 1",
    levels: ["pra_tahsin", "tahsin", "tahfiz"],
    assignedById: ids.admin,
  }]);

  await assert.rejects(
    () => service.assign({ academicYear: "2026/2027", examinerUserId: ids.examiner, target: "peserta", gender: "ikhwan", unitId: null, levels: ["tahsin"] }, admin),
    BadRequestException,
  );
  await assert.rejects(
    () => service.assign({ academicYear: "2026/2027", examinerUserId: ids.examiner, target: "pembina", gender: "akhwat", unitId: ids.unit, levels: [] }, admin),
    BadRequestException,
  );
  await assert.rejects(
    () => service.assign({ academicYear: "2026/2027", examinerUserId: ids.examiner, target: "pembina", gender: "akhwat", unitId: null, levels: ["tahsin"] }, admin),
    BadRequestException,
  );
  await assert.rejects(
    () => service.assign({ academicYear: "2026/2027", examinerUserId: ids.examiner, target: "peserta", gender: "ikhwan", unitId: ids.unit, levels: ["tahsin"] }, outsider),
    ForbiddenException,
  );

  const duplicate = new ExaminerAssignmentsService(createPrisma({ active: { id: ids.assignment } }).prisma as never);
  await assert.rejects(
    () => duplicate.assign({ academicYear: "2026/2027", examinerUserId: ids.examiner, target: "peserta", gender: "ikhwan", unitId: ids.unit, levels: ["tahsin"] }, admin),
    BadRequestException,
  );

  const revocable = createPrisma({ assignment: { id: ids.assignment, revokedAt: null } });
  const revokeService = new ExaminerAssignmentsService(revocable.prisma as never);
  assert.deepEqual(await revokeService.revoke(ids.assignment, admin), { id: ids.assignment, revoked: true });
  assert.equal(revocable.updated.length, 1);
  assert.ok((revocable.updated[0] as { revokedAt?: unknown }).revokedAt instanceof Date);

  console.log("SIYAUM YMQ examiner assignment contract passed");
}

void main();
