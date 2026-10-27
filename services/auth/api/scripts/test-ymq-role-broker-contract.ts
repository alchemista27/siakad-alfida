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

type Role = { app: string; role: string };

function createPrisma(options: {
  actorRoles?: Role[];
  targetActive?: boolean;
  targetRoles?: Role[];
  initialRole?: "admin_ymq" | "peserta" | "pembina_ymq" | "admin_kelompok" | "pengawas" | "pimpinan";
}) {
  let assignments: Array<Record<string, unknown>> = options.initialRole
    ? [{ id: "existing-role", userId, app: "siyaum", role: options.initialRole, unitId: null, departmentId: null }]
    : [];
  let created = 0;
  let clearedSessions = 0;

  const prisma = {
    user: {
      findUnique: async ({ where, include }: { where: { id: string }; include?: unknown }) => {
        if (where.id === actorUserId) {
          return { id: actorUserId, isActive: true, roles: options.actorRoles ?? [{ app: "siyaum", role: "admin_ymq" }] };
        }
        if (where.id === userId) {
          return {
            id: userId,
            isActive: options.targetActive ?? true,
            roles: options.targetRoles ?? [{ app: "simpeg", role: "pegawai" }],
          };
        }
        return null;
      },
    },
    roleAssignment: {
      findFirst: async ({ where }: { where: Record<string, unknown> }) => (
        assignments.find((assignment) => Object.entries(where).every(([key, value]) => assignment[key] === value)) ?? null
      ),
      findMany: async ({ where }: { where: Record<string, unknown> }) => (
        assignments.filter((assignment) => Object.entries(where).every(([key, value]) => assignment[key] === value))
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

  return { prisma, created: () => created, clearedSessions: () => clearedSessions };
}

async function main() {
  for (const role of ["admin_ymq", "peserta", "pembina_ymq", "admin_kelompok", "pengawas", "pimpinan"] as const) {
    assert.deepEqual(
      validateYmqRoleBrokerAssignInput({ actorUserId, userId, role }),
      { actorUserId, userId, role },
      `the broker must accept ${role}`,
    );
  }
  assert.throws(
    () => validateYmqRoleBrokerAssignInput({ actorUserId, userId, role: "musyrif" }),
    BadRequestException,
    "musyrif must no longer be accepted by Auth",
  );
  assert.throws(
    () => validateYmqRoleBrokerAssignInput({ actorUserId: "not-a-uuid", userId, role: "peserta" }),
    BadRequestException,
  );

  const admin = new YmqRoleBrokerService(createPrisma({}).prisma as any);
  const participant = await admin.assign({ actorUserId, userId, role: "peserta" });
  assert.equal(participant.changed, true);

  await assert.rejects(
    () => admin.assign({ actorUserId, userId, role: "admin_ymq" }),
    ForbiddenException,
    "admin_ymq must not bootstrap another admin",
  );
  await assert.doesNotReject(
    () => new YmqRoleBrokerService(createPrisma({ actorRoles: [{ app: "auth", role: "super_admin" }] }).prisma as any)
      .assign({ actorUserId, userId, role: "admin_ymq" }),
    "auth-scoped Super Admin may bootstrap Admin YMQ",
  );
  await assert.doesNotReject(
    () => new YmqRoleBrokerService(createPrisma({ actorRoles: [{ app: "core", role: "super_admin" }] }).prisma as any)
      .assign({ actorUserId, userId, role: "pengawas" }),
    "core-scoped Super Admin must retain global override",
  );
  await assert.rejects(
    () => new YmqRoleBrokerService(createPrisma({ actorRoles: [{ app: "siyaum", role: "peserta" }] }).prisma as any)
      .assign({ actorUserId, userId, role: "peserta" }),
    ForbiddenException,
  );

  await assert.rejects(
    () => new YmqRoleBrokerService(createPrisma({ targetRoles: [] }).prisma as any)
      .assign({ actorUserId, userId, role: "peserta" }),
    BadRequestException,
    "only SIMPEG employees can become participants",
  );
  await assert.rejects(
    () => new YmqRoleBrokerService(createPrisma({ targetRoles: [{ app: "simpeg", role: "pegawai" }] }).prisma as any)
      .assign({ actorUserId, userId, role: "pembina_ymq" }),
    BadRequestException,
    "operational roles require existing participant status",
  );
  await assert.doesNotReject(
    () => new YmqRoleBrokerService(createPrisma({ targetRoles: [{ app: "simpeg", role: "pegawai" }, { app: "siyaum", role: "peserta" }] }).prisma as any)
      .assign({ actorUserId, userId, role: "pembina_ymq" }),
  );

  const duplicateState = createPrisma({ initialRole: "peserta" });
  const duplicateService = new YmqRoleBrokerService(duplicateState.prisma as any);
  const duplicate = await duplicateService.assign({ actorUserId, userId, role: "peserta" });
  assert.equal(duplicate.changed, false);
  assert.equal(duplicateState.clearedSessions(), 0, "idempotent grant must not clear sessions");
  await duplicateService.revoke({ actorUserId, userId, role: "peserta" });
  assert.equal(duplicateState.clearedSessions(), 1, "effective revocation must clear sessions");

  await assert.rejects(
    () => new YmqRoleBrokerService(createPrisma({ targetActive: false }).prisma as any)
      .assign({ actorUserId, userId, role: "peserta" }),
    NotFoundException,
  );

  const originalSecret = process.env.INTERNAL_SERVICE_SECRET;
  const guardContext = (header: string | undefined) => ({ switchToHttp: () => ({ getRequest: () => ({ header: () => header }) }) });
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
  assert.equal(Reflect.getMetadata(PATH_METADATA, YmqRoleBrokerController.prototype.list), "roles/:role");
  assert.equal(Reflect.getMetadata(METHOD_METADATA, YmqRoleBrokerController.prototype.list), RequestMethod.GET);

  const calls: Array<{ method: string; input: unknown }> = [];
  const controller = new YmqRoleBrokerController({
    assign: async (input: unknown) => { calls.push({ method: "assign", input }); return { ok: true }; },
    revoke: async (input: unknown) => { calls.push({ method: "revoke", input }); return { ok: true }; },
    list: async (role: string) => { calls.push({ method: "list", input: role }); return []; },
  } as any);
  await controller.assign({ actorUserId, userId, role: "peserta" });
  await controller.revoke(userId, "admin_kelompok", { actorUserId });
  await controller.list("admin_ymq");
  assert.deepEqual(calls, [
    { method: "assign", input: { actorUserId, userId, role: "peserta" } },
    { method: "revoke", input: { actorUserId, userId, role: "admin_kelompok" } },
    { method: "list", input: "admin_ymq" },
  ]);

  const guardSource = readFileSync(join(process.cwd(), "src/ymq-role-broker/internal-ymq-role-broker.guard.ts"), "utf8");
  assert.doesNotMatch(guardSource, /console\.(?:log|warn|error)[^\n]*INTERNAL_SERVICE_SECRET/);
  console.log("YMQ role broker contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
