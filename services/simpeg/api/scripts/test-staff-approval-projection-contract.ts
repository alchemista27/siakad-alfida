import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { InternalStaffApprovalGuard } from "../src/staff-approval-projection/internal-staff-approval.guard";
import { StaffApprovalProjectionService } from "../src/staff-approval-projection/staff-approval-projection.service";

const userId = "00000000-0000-4000-8000-000000000001";
const unitId = "00000000-0000-4000-8000-000000000002";

async function main() {
  const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
  const migration = readFileSync(
    resolve(process.cwd(), "prisma/migrations/20261026061455_add_staff_approval_source_key/migration.sql"),
    "utf8",
  );
  assert.match(schema, /sourceKey\s+String\?\s+@unique\s+@map\("source_key"\)/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS "source_key"/);
  assert.match(migration, /CREATE UNIQUE INDEX IF NOT EXISTS "employee_unit_assignments_source_key_key"/);

  const audit: string[] = [];
  const prisma = {
    unit: {
      findUnique: async ({ where }: any) => where.id === unitId
        ? { id: unitId, name: "SDIT Iqra", isActive: true }
        : null,
    },
    $transaction: async (callback: any) => callback({
      user: {
        upsert: async ({ create, update }: any) => {
          audit.push(`user:${create.id}:${update.isActive}`);
          return { id: create.id };
        },
      },
      employeeUnitAssignment: {
        updateMany: async ({ where }: any) => {
          audit.push(`demote:${where.userId}`);
          return { count: 0 };
        },
        upsert: async ({ where, create, update }: any) => {
          audit.push(`assignment:${where.sourceKey}:${create.unitId}:${create.role}:${update.isPrimary}`);
          return { id: "assignment-1", ...create };
        },
      },
    }),
  };
  const service = new StaffApprovalProjectionService(prisma as never);

  await service.upsert(userId, {
    id: userId,
    fullName: "Guru Baru",
    email: "guru.baru@example.test",
    username: null,
    phone: "081234567890",
    avatarUrl: null,
    unitId,
    employmentRole: "guru",
  });

  assert.deepEqual(audit, [
    `user:${userId}:true`,
    `demote:${userId}`,
    `assignment:auth-staff-approval:${userId}:${unitId}:guru:true`,
  ], "SIMPEG must idempotently project the approved user and primary unit assignment");

  await assert.rejects(
    () => service.upsert(userId, {
      id: userId,
      fullName: "Guru Baru",
      email: "guru.baru@example.test",
      username: null,
      phone: "081234567890",
      avatarUrl: null,
      unitId: "00000000-0000-4000-8000-000000000099",
      employmentRole: "guru",
    }),
    /Unit/i,
    "SIMPEG must reject an approval pointing at a missing or inactive unit",
  );

  const oldToken = process.env.SIMPEG_INTERNAL_SERVICE_TOKEN;
  const guard = new InternalStaffApprovalGuard();
  const context = (headers: Record<string, string>) => ({
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  }) as never;
  delete process.env.SIMPEG_INTERNAL_SERVICE_TOKEN;
  assert.throws(() => guard.canActivate(context({})), ServiceUnavailableException);
  process.env.SIMPEG_INTERNAL_SERVICE_TOKEN = "staff-approval-secret";
  assert.throws(() => guard.canActivate(context({ "x-internal-service-token": "wrong" })), UnauthorizedException);
  assert.equal(guard.canActivate(context({ "x-internal-service-token": "staff-approval-secret" })), true);
  if (oldToken === undefined) delete process.env.SIMPEG_INTERNAL_SERVICE_TOKEN;
  else process.env.SIMPEG_INTERNAL_SERVICE_TOKEN = oldToken;

  console.log("SIMPEG staff approval projection contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
