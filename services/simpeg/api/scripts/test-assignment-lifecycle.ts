import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BadRequestException } from "@nestjs/common";
import { AssignmentsService } from "../src/assignments/assignments.service";
import { StaffApprovalProjectionService } from "../src/staff-approval-projection/staff-approval-projection.service";

const userId = "00000000-0000-4000-8000-000000000001";
const parentUserId = "00000000-0000-4000-8000-000000000002";
const sourceAssignmentId = "00000000-0000-4000-8000-000000000010";
const unitA = "00000000-0000-4000-8000-000000000011";
const unitB = "00000000-0000-4000-8000-000000000012";
const hrPrincipal = { roles: [{ app: "simpeg", role: "admin_kepegawaian" }] };

function assignment(overrides: Record<string, unknown> = {}) {
  return {
    id: sourceAssignmentId,
    userId,
    unitId: unitA,
    unitName: "Unit Asal",
    role: "guru",
    isPrimary: true,
    startDate: new Date("2026-01-01T00:00:00.000Z"),
    endDate: null,
    skNumber: "SK-001",
    notes: "Penugasan awal",
    sourceKey: `auth-staff-approval:${userId}`,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function createAssignmentPrisma() {
  const records = new Map<string, ReturnType<typeof assignment>>([[sourceAssignmentId, assignment()]]);
  const audit: string[] = [];
  const employeeUnitAssignment = {
    async findUnique({ where }: any) {
      return records.get(where.id) ?? null;
    },
    async findFirst({ where }: any) {
      return [...records.values()].find((record) => {
        if (where.userId && record.userId !== where.userId) return false;
        if (where.isPrimary !== undefined && record.isPrimary !== where.isPrimary) return false;
        if (where.id && record.id !== where.id) return false;
        return true;
      }) ?? null;
    },
    async findMany() {
      return [...records.values()];
    },
    async create({ data }: any) {
      const id = "00000000-0000-4000-8000-000000000099";
      const created = assignment({ id, ...data, sourceKey: data.sourceKey ?? null, createdAt: new Date() });
      records.set(id, created);
      audit.push(`create:${created.unitId}:${created.isPrimary}:${created.sourceKey}`);
      return created;
    },
    async update({ where, data }: any) {
      const existing = records.get(where.id);
      if (!existing) throw new Error("missing assignment");
      const updated = { ...existing, ...data };
      records.set(where.id, updated);
      audit.push(`update:${where.id}:${updated.unitId}:${updated.isPrimary}:${updated.endDate?.toISOString().slice(0, 10) ?? "null"}`);
      return updated;
    },
    async updateMany({ where, data }: any) {
      audit.push(`updateMany:${where.userId}:${data.isPrimary}`);
      return { count: 0 };
    },
    async upsert({ where, create, update }: any) {
      audit.push(`upsert:${where.sourceKey}`);
      const existing = [...records.values()].find((record) => record.sourceKey === where.sourceKey);
      if (existing) {
        const next = { ...existing, ...update };
        records.set(existing.id, next);
        return next;
      }
      const id = "00000000-0000-4000-8000-000000000098";
      const next = assignment({ id, ...create });
      records.set(id, next);
      return next;
    },
    async delete({ where }: any) {
      const deleted = records.get(where.id);
      if (!deleted) throw new Error("missing assignment");
      records.delete(where.id);
      return deleted;
    },
  };

  const prisma = {
    unit: {
      async findUnique({ where }: any) {
        if (where.id === unitA) return { id: unitA, name: "Unit Asal", isActive: true };
        if (where.id === unitB) return { id: unitB, name: "Unit Tujuan", isActive: true };
        return null;
      },
    },
    user: {
      async findUnique({ where }: any) {
        return [userId, parentUserId].includes(where.id) ? { id: where.id, isActive: true } : null;
      },
      async upsert({ create, update }: any) {
        audit.push(`user:${create.id}:${update.isActive}`);
        return { id: create.id };
      },
    },
    employeeUnitAssignment,
    async $transaction(callback: any) {
      return callback({ user: this.user, employeeUnitAssignment });
    },
  };

  return { prisma, records, audit };
}

async function main() {
  const controller = readFileSync(resolve(import.meta.dirname, "../src/assignments/assignments.controller.ts"), "utf8");
  const module = readFileSync(resolve(import.meta.dirname, "../src/assignments/assignments.module.ts"), "utf8");
  assert.match(controller, /SimpegRolesGuard/, "assignment endpoints must use SimpegRolesGuard");
  assert.match(controller, /@Post\(":id\/mutate"\)/, "assignment controller must expose a mutation endpoint");
  assert.match(controller, /@SimpegRoles\("super_admin", "admin_kepegawaian"\)/, "assignment mutation must be HR-only");
  assert.match(module, /SimpegRolesGuard/, "AssignmentsModule must provide SimpegRolesGuard");

  const lifecycle = createAssignmentPrisma();
  const eligibilityAudit: string[] = [];
  const authStaffCandidates = {
    async isEligible(candidateId: string) {
      eligibilityAudit.push(candidateId);
      return candidateId !== parentUserId;
    },
  };
  const service = new AssignmentsService(lifecycle.prisma as never, authStaffCandidates as never);
  const result = await (service as any).mutate(sourceAssignmentId, {
    unitId: unitB,
    role: "guru_mapel",
    effectiveDate: "2026-02-01",
    skNumber: "SK-002",
    notes: "Mutasi antar unit",
  }, hrPrincipal);

  assert.equal(result.endedAssignment.endDate.toISOString().slice(0, 10), "2026-01-31");
  assert.equal(result.endedAssignment.isPrimary, true, "former primary must remain historical primary, not become an additional task");
  assert.equal(result.newAssignment.unitId, unitB);
  assert.equal(result.newAssignment.unitName, "Unit Tujuan");
  assert.equal(result.newAssignment.isPrimary, true);
  assert.equal(result.newAssignment.sourceKey, null);
  assert.deepEqual(lifecycle.audit.slice(0, 2), [
    `update:${sourceAssignmentId}:${unitA}:true:2026-01-31`,
    `create:${unitB}:true:null`,
  ]);

  await assert.rejects(
    () => service.create({
      userId,
      unitId: unitB,
      role: "guru_mapel",
      isPrimary: true,
      startDate: "2026-02-01",
    } as any, hrPrincipal),
    (error: unknown) => error instanceof BadRequestException && /Gunakan mutasi/i.test(error.message),
    "creating another active primary must direct HR to mutation",
  );
  assert.deepEqual(eligibilityAudit, [userId], "the selected user must be checked against Auth before an assignment is created");

  await assert.rejects(
    () => service.create({
      userId: parentUserId,
      unitId: unitB,
      role: "tugas_tambahan",
      isPrimary: false,
      startDate: "2026-02-01",
    } as any, hrPrincipal),
    (error: unknown) => error instanceof BadRequestException
      && error.message === "Hanya akun pegawai/guru/karyawan aktif yang dapat ditugaskan.",
    "a parent-only account must be rejected even when it exists in SIMPEG's user projection",
  );
  assert.deepEqual(eligibilityAudit, [userId, parentUserId]);

  const updated = await service.update(sourceAssignmentId, {
    unitId: unitB,
    role: "guru_kelas",
  } as any, hrPrincipal);
  assert.equal(updated.id, sourceAssignmentId, "an edit must retain its assignment id");
  assert.equal(updated.unitId, unitB);
  assert.equal(updated.unitName, "Unit Tujuan", "the server must derive canonical unitName");

  const projection = createAssignmentPrisma();
  await projection.prisma.employeeUnitAssignment.create({
    data: {
      userId,
      unitId: unitB,
      unitName: "Unit Tujuan",
      role: "guru_mapel",
      isPrimary: true,
      startDate: new Date("2026-02-01T00:00:00.000Z"),
      endDate: null,
      sourceKey: null,
    },
  });
  projection.audit.length = 0;
  const projector = new StaffApprovalProjectionService(projection.prisma as never);
  await projector.upsert(userId, {
    id: userId,
    fullName: "Pegawai Mutasi",
    email: "pegawai.mutasi@example.test",
    username: null,
    phone: null,
    avatarUrl: null,
    unitId: unitA,
    employmentRole: "guru",
  });
  assert.deepEqual(
    projection.audit.filter((entry) => entry.startsWith("updateMany:") || entry.startsWith("upsert:")),
    [],
    "staff approval retry must not overwrite an active HR-managed primary assignment",
  );

  console.log("SIMPEG assignment lifecycle contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
