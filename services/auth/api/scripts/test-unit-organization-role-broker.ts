import assert from "node:assert/strict";

import { BadRequestException } from "@nestjs/common";
import { validateOrganizationRoleInput } from "../src/users/organization-roles.dto";
import { UsersService } from "../src/users/users.service";

async function main() {
  const userId = "00000000-0000-4000-8000-000000000001";
  const unitId = "00000000-0000-4000-8000-000000000002";
  const otherUnitId = "00000000-0000-4000-8000-000000000003";

  const validUnitInput = validateOrganizationRoleInput({
    userId,
    scope: "unit",
    unitId,
    app: "simpeg",
    role: "admin_unit",
  });
  assert.deepEqual(validUnitInput, {
    userId,
    scope: "unit",
    unitId,
    app: "simpeg",
    role: "admin_unit",
  });

  for (const invalidInput of [
    { userId, scope: "unit", app: "simpeg", role: "admin_unit" },
    { userId, scope: "unit", unitId, app: "siakad", role: "admin_unit_nondik" },
    { userId, scope: "unit", unitId, app: "spmb", role: "admin_unit_nondik" },
    { userId, scope: "department", departmentId: unitId, app: "simakin", role: "admin_unit" },
  ]) {
    assert.throws(() => validateOrganizationRoleInput(invalidInput), BadRequestException);
  }

  let assignments: Array<Record<string, unknown>> = [];
  let created = 0;
  let clearedSessions = 0;
  let lastFindWhere: Record<string, unknown> | undefined;
  const prisma = {
    user: {
      findUnique: async () => ({ id: userId, isActive: true }),
    },
    roleAssignment: {
      findFirst: async ({ where }: { where: Record<string, unknown> }) => {
        lastFindWhere = where;
        return assignments.find((assignment) =>
          Object.entries(where).every(([key, value]) => assignment[key] === value),
        ) ?? null;
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        created += 1;
        const assignment = { ...data };
        assignments.push(assignment);
        return assignment;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const assignment = assignments.find((entry) => entry.id === where.id);
        if (!assignment) throw new Error("missing assignment");
        assignments = assignments.filter((entry) => entry.id !== where.id);
        return assignment;
      },
    },
    session: {
      deleteMany: async ({ where }: { where: { userId: string } }) => {
        assert.deepEqual(where, { userId });
        clearedSessions += 1;
        return { count: 1 };
      },
    },
  };

  const service = new UsersService(prisma as any);
  const first = await service.upsertOrganizationRole(validUnitInput);
  assert.equal(created, 1);
  assert.equal(clearedSessions, 1);
  assert.deepEqual(lastFindWhere, {
    userId,
    app: "simpeg",
    role: "admin_unit",
    unitId,
    departmentId: null,
  });

  const duplicate = await service.upsertOrganizationRole(validUnitInput);
  assert.equal(duplicate, first, "duplicate grants must return the existing assignment");
  assert.equal(created, 1, "duplicate grants must not create another assignment");
  assert.equal(clearedSessions, 1, "unchanged duplicate grants must not clear sessions");

  assignments.push({
    id: "other-unit-role",
    userId,
    app: "simpeg",
    role: "admin_unit",
    unitId: otherUnitId,
    departmentId: null,
  });
  await service.removeOrganizationRole(validUnitInput);
  assert.equal(clearedSessions, 2, "revocation must clear sessions");
  assert.deepEqual(lastFindWhere, {
    userId,
    app: "simpeg",
    role: "admin_unit",
    unitId,
    departmentId: null,
  });
  assert.equal(assignments.length, 1, "revocation must retain an assignment in a different unit");
  assert.equal(assignments[0].unitId, otherUnitId);

  const repeatedRevocation = await service.removeOrganizationRole(validUnitInput);
  assert.deepEqual(repeatedRevocation, { deleted: false }, "revocation must be idempotent");
  assert.equal(clearedSessions, 2, "a no-op revocation must not clear sessions");

  console.log("Unit organization role broker contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
