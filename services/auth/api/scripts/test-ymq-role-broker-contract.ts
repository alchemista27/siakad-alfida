import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { PATH_METADATA, METHOD_METADATA } from "@nestjs/common/constants";
import { RequestMethod } from "@nestjs/common/enums/request-method.enum";
import { InternalYmqRoleBrokerGuard } from "../src/ymq-role-broker/internal-ymq-role-broker.guard";
import { YmqRoleBrokerController } from "../src/ymq-role-broker/ymq-role-broker.controller";
import { validateYmqRoleBrokerAssignInput } from "../src/ymq-role-broker/ymq-role-broker.policy";
import { YmqRoleBrokerService } from "../src/ymq-role-broker/ymq-role-broker.service";

const actorUserId = "00000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000002";

function createPrisma(options: {
  actorRoles?: Array<{ app: string; role: string }>;
  targetActive?: boolean;
  initialRole?: "pembina_ymq" | "admin_kelompok";
}) {
  let assignments: Array<Record<string, unknown>> = options.initialRole
    ? [{ id: "existing-role", userId, app: "siyaum", role: options.initialRole, unitId: null, departmentId: null }]
    : [];
  let created = 0;
  let clearedSessions = 0;

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        if (where.id === actorUserId) {
          return { id: actorUserId, isActive: true, roles: options.actorRoles ?? [{ app: "siyaum", role: "admin_ymq" }] };
        }
        if (where.id === userId) {
          return { id: userId, isActive: options.targetActive ?? true, roles: [] };
        }
        return null;
      },
    },
    roleAssignment: {
      findFirst: async ({ where }: { where: Record<string, unknown> }) => (
        assignments.find((assignment) => Object.entries(where).every(([key, value]) => assignment[key] === value)) ?? null
      ),
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

  return {
    prisma,
    created: () => created,
    clearedSessions: () => clearedSessions,
  };
}

async function main() {
  const input = validateYmqRoleBrokerAssignInput({ actorUserId, userId, role: "pembina_ymq" });
  assert.deepEqual(input, { actorUserId, userId, role: "pembina_ymq" });
  assert.deepEqual(
    validateYmqRoleBrokerAssignInput({ actorUserId, userId, role: "admin_kelompok" }),
    { actorUserId, userId, role: "admin_kelompok" },
    "the broker must grant admin_kelompok",
  );
  assert.throws(
    () => validateYmqRoleBrokerAssignInput({ actorUserId: "not-a-uuid", userId, role: "pembina_ymq" }),
    BadRequestException,
    "actor identity must be a valid UUID",
  );
  assert.throws(
    () => validateYmqRoleBrokerAssignInput({ actorUserId, userId, role: "admin_ymq" }),
    BadRequestException,
    "the broker must reject all non-delegable YMQ roles",
  );
  assert.throws(
    () => validateYmqRoleBrokerAssignInput({ actorUserId, userId, role: "pembina_ymq", unexpected: true }),
    BadRequestException,
    "the broker payload must be strict",
  );

  const state = createPrisma({});
  const service = new YmqRoleBrokerService(state.prisma as any);
  const assignment = await service.assign(input);
  assert.equal(assignment.app, "siyaum");
  assert.equal(assignment.role, "pembina_ymq");
  assert.equal(assignment.changed, true, "a newly created role must be reported as changed");
  assert.equal(state.created(), 1, "an effective grant must create exactly one role assignment");
  assert.equal(state.clearedSessions(), 1, "an effective grant must invalidate sessions");

  const duplicateAssignment = await service.assign(input);
  assert.equal(duplicateAssignment.changed, false, "an existing role must be reported as unchanged");
  assert.equal(state.created(), 1, "duplicate grants must be idempotent");
  assert.equal(state.clearedSessions(), 1, "no-op grants must not invalidate sessions");

  await service.revoke({ actorUserId, userId, role: "pembina_ymq" });
  assert.equal(state.clearedSessions(), 2, "an effective revocation must invalidate sessions");
  assert.deepEqual(
    await service.revoke({ actorUserId, userId, role: "pembina_ymq" }),
    { deleted: false },
    "duplicate revocations must be idempotent",
  );
  assert.equal(state.clearedSessions(), 2, "no-op revocations must not invalidate sessions");

  await assert.rejects(
    () => new YmqRoleBrokerService(createPrisma({ actorRoles: [{ app: "siyaum", role: "peserta" }] }).prisma as any).assign(input),
    ForbiddenException,
    "only siyaum:admin_ymq may delegate YMQ roles",
  );
  await assert.doesNotReject(
    () => new YmqRoleBrokerService(createPrisma({ actorRoles: [{ app: "*", role: "super_admin" }] }).prisma as any).assign(input),
    "global super_admin may delegate YMQ roles",
  );
  await assert.doesNotReject(
    () => new YmqRoleBrokerService(createPrisma({ actorRoles: [{ app: "auth", role: "super_admin" }] }).prisma as any).assign(input),
    "the catalog's auth-scoped super_admin is global",
  );
  await assert.rejects(
    () => service.assign({ actorUserId, userId: actorUserId, role: "pembina_ymq" }),
    BadRequestException,
    "actors must not grant themselves YMQ roles",
  );
  await assert.rejects(
    () => new YmqRoleBrokerService(createPrisma({ targetActive: false }).prisma as any).assign(input),
    NotFoundException,
    "the target user must be active",
  );
  await assert.doesNotReject(
    () => new YmqRoleBrokerService(createPrisma({ targetActive: false, initialRole: "pembina_ymq" }).prisma as any).revoke({ actorUserId, userId, role: "pembina_ymq" }),
    "inactive users must still be deprovisioned safely",
  );

  const originalSecret = process.env.INTERNAL_SERVICE_SECRET;
  const guardContext = (header: string | undefined) => ({
    switchToHttp: () => ({ getRequest: () => ({ header: () => header }) }),
  });
  try {
    delete process.env.INTERNAL_SERVICE_SECRET;
    assert.throws(() => new InternalYmqRoleBrokerGuard().canActivate(guardContext("test-secret") as any), ServiceUnavailableException);

    process.env.INTERNAL_SERVICE_SECRET = "test-secret";
    assert.throws(() => new InternalYmqRoleBrokerGuard().canActivate(guardContext("wrong-secret") as any), UnauthorizedException);
    assert.equal(new InternalYmqRoleBrokerGuard().canActivate(guardContext("test-secret") as any), true);
  } finally {
    if (originalSecret === undefined) delete process.env.INTERNAL_SERVICE_SECRET;
    else process.env.INTERNAL_SERVICE_SECRET = originalSecret;
  }

  assert.equal(Reflect.getMetadata(PATH_METADATA, YmqRoleBrokerController), "internal/ymq-role-broker");
  assert.equal(Reflect.getMetadata(PATH_METADATA, YmqRoleBrokerController.prototype.assign), "assign");
  assert.equal(Reflect.getMetadata(METHOD_METADATA, YmqRoleBrokerController.prototype.assign), RequestMethod.POST);
  assert.equal(Reflect.getMetadata(PATH_METADATA, YmqRoleBrokerController.prototype.revoke), "users/:userId/roles/:role");
  assert.equal(Reflect.getMetadata(METHOD_METADATA, YmqRoleBrokerController.prototype.revoke), RequestMethod.DELETE);

  const calls: Array<{ method: string; input: unknown }> = [];
  const controller = new YmqRoleBrokerController({
    assign: async (assignInput: unknown) => {
      calls.push({ method: "assign", input: assignInput });
      return { ok: true };
    },
    revoke: async (revokeInput: unknown) => {
      calls.push({ method: "revoke", input: revokeInput });
      return { ok: true };
    },
  } as any);
  await controller.assign({ actorUserId, userId, role: "pembina_ymq" });
  await controller.revoke(userId, "admin_kelompok", { actorUserId });
  assert.deepEqual(calls, [
    { method: "assign", input: { actorUserId, userId, role: "pembina_ymq" } },
    { method: "revoke", input: { actorUserId, userId, role: "admin_kelompok" } },
  ]);
  assert.throws(() => controller.revoke(userId, "musyrif", { actorUserId }), BadRequestException);

  const guardSource = readFileSync(join(process.cwd(), "src/ymq-role-broker/internal-ymq-role-broker.guard.ts"), "utf8");
  assert.doesNotMatch(guardSource, /console\.(?:log|warn|error)[^\n]*INTERNAL_SERVICE_SECRET/);
  const appModuleSource = readFileSync(join(process.cwd(), "src/app.module.ts"), "utf8");
  assert.match(appModuleSource, /YmqRoleBrokerModule/);

  console.log("YMQ role broker contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
