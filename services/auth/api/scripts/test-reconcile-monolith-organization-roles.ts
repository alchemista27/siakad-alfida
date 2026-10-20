import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildReconciliationPlan,
  reconcileMonolithOrganizationRoles,
  type ScopedRole,
} from "./reconcile-monolith-organization-roles";

const exportPath = "/home/alchemista/.hermes/cache/scratch/monolith-org-export.json";

type StoredRole = ScopedRole & { id: string; userId: string };

function key(role: ScopedRole & { userId: string }): string {
  return [role.userId, role.app, role.role, role.unitId ?? "", role.departmentId ?? ""].join("\u001f");
}

function createMockPrisma(users: Array<{ id: string; email: string }>) {
  const roles: StoredRole[] = [];
  const calls = {
    modelAccesses: [] as string[],
    userFindMany: 0,
    roleFindMany: 0,
    creates: 0,
    sessionDeletes: [] as string[],
  };
  const transaction = {
    roleAssignment: {
      create: async ({ data }: { data: ScopedRole & { userId: string } }) => {
        assert.equal("passwordHash" in data, false, "role write must not carry a password hash");
        roles.push({ ...data, id: `role-${roles.length + 1}` });
        calls.creates += 1;
        return roles[roles.length - 1];
      },
    },
    session: {
      deleteMany: async ({ where }: { where: { userId: string } }) => {
        calls.sessionDeletes.push(where.userId);
        return { count: 1 };
      },
    },
  };
  const prismaTarget = {
    user: {
      findMany: async (args: { select: Record<string, unknown>; where: { OR: unknown[] } }) => {
        calls.userFindMany += 1;
        assert.deepEqual(args.select, { id: true, email: true }, "canonical user lookup must not select credentials");
        assert.ok(args.where.OR.length > 0, "canonical users must be looked up by normalized email");
        return users;
      },
    },
    roleAssignment: {
      findMany: async (args: { select: Record<string, unknown>; where: { userId: { in: string[] } } }) => {
        calls.roleFindMany += 1;
        assert.deepEqual(args.select, {
          id: true,
          userId: true,
          app: true,
          role: true,
          unitId: true,
          departmentId: true,
        });
        return roles.filter((role) => args.where.userId.in.includes(role.userId));
      },
    },
    session: transaction.session,
    $transaction: async <T>(callback: (client: typeof transaction) => Promise<T>) => callback(transaction),
    $disconnect: async () => undefined,
  };
  const prisma = new Proxy(prismaTarget, {
    get(target, property, receiver) {
      if (typeof property === "string") calls.modelAccesses.push(property);
      return Reflect.get(target, property, receiver);
    },
  });
  return { prisma, roles, calls };
}

async function main() {
  const raw = JSON.parse(await readFile(exportPath, "utf8")) as unknown;
  const plan = buildReconciliationPlan(raw);
  const counts = new Map<string, number>();
  for (const role of plan.desiredRoles) {
    const roleName = `${role.app}:${role.role}`;
    counts.set(roleName, (counts.get(roleName) ?? 0) + 1);
  }

  assert.equal(plan.desiredRoles.length, 56, "raw source export must produce the expected desired grants");
  assert.equal(plan.sourceDuplicateRoles, 5, "duplicate admin_biro source rows must collapse to one global grant per user");
  assert.deepEqual(Object.fromEntries(counts), {
    "core:admin_unit": 7,
    "simpeg:admin_unit": 7,
    "siakad:admin_unit": 7,
    "spmb:admin_unit": 7,
    "*:super_admin": 1,
    "simpeg:pegawai": 2,
    "siakad:guru": 1,
    "spmb:orang_tua": 6,
    "siakad:orang_tua": 6,
    "simakin:pengawas": 2,
    "simakin:admin_biro": 7,
    "simakin:admin_bidang": 3,
  });
  assert.equal(
    plan.desiredRoles.filter((role) => role.email === "biro.quran@alfida.or.id" && role.role === "admin_biro").length,
    1,
    "duplicate admin_biro source rows must be deduplicated",
  );
  assert.deepEqual(plan.quarantines, [{
    sourceUserId: "d59f7552-a9ab-44c5-8631-2385b86f925c",
    email: "gurniims@gmail.com",
    sourceRole: "admin_bidang",
    reason: "admin_bidang_not_department_admin",
  }]);
  assert.deepEqual(plan.reports, [{
    sourceUserId: "ccb10a71-b9da-44c9-9c55-11767c44c38c",
    email: "dummy@gmail.com",
    sourceRole: "guru",
    reason: "unitless_guru",
  }]);
  assert.equal(plan.desiredRoles.some((role) => role.email === "dummy@gmail.com"), false, "unitless guru must not gain simpeg or siakad roles");
  const source = raw as {
    users: Array<{ id: string; email: string; roles: Array<{ role: string; unitId: string | null }> }>;
    departmentAdmins: Array<{ departmentId: string; userId: string }>;
  };
  const iqraAdmin = source.users.find((user) => user.email === "admin.iqra1@alfida.or.id");
  assert.ok(iqraAdmin);
  assert.deepEqual(
    plan.desiredRoles
      .filter((role) => role.sourceUserId === iqraAdmin.id)
      .map((role) => ({ app: role.app, role: role.role, unitId: role.unitId, departmentId: role.departmentId })),
    ["core", "simpeg", "siakad", "spmb"].map((app) => ({
      app,
      role: "admin_unit",
      unitId: iqraAdmin.roles[0].unitId,
      departmentId: null,
    })),
    "admin_unit must retain its raw source-unit scope in all four target apps",
  );
  assert.deepEqual(
    new Set(plan.desiredRoles
      .filter((role) => role.role === "admin_bidang")
      .map((role) => `${role.sourceUserId}:${role.departmentId}`)),
    new Set(source.departmentAdmins.map((admin) => `${admin.userId}:${admin.departmentId}`)),
    "admin_bidang must use exactly the source department-admin user and department scopes",
  );
  const malformed = structuredClone(raw) as { departmentAdmins: Array<{ departmentId: string; userId: string }> };
  malformed.departmentAdmins[0].departmentId = "not-a-source-department";
  assert.throws(() => buildReconciliationPlan(malformed), /unknown department/, "invalid references must stop reconciliation");

  const sourceUsers = source.users;
  const authUsers = sourceUsers.map((user, index) => ({ id: `auth-${index + 1}`, email: user.email.trim().toUpperCase() }));
  const mock = createMockPrisma(authUsers);
  mock.roles.push({
    id: "microservice-only-role",
    userId: "auth-1",
    app: "siyaum",
    role: "existing_only",
    unitId: null,
    departmentId: null,
  });

  const dryRun = await reconcileMonolithOrganizationRoles(mock.prisma as never, raw, false);
  assert.equal(dryRun.missingRoles, 56);
  assert.equal(dryRun.createdRoles, 0, "dry runs must not create roles");
  assert.equal(dryRun.invalidatedSessions, 0, "dry runs must not delete sessions");
  assert.equal(mock.calls.creates, 0);
  assert.deepEqual(mock.calls.sessionDeletes, []);

  const firstApply = await reconcileMonolithOrganizationRoles(mock.prisma as never, raw, true);
  assert.equal(firstApply.createdRoles, 56, "apply must create every missing desired grant once");
  assert.equal(mock.roles.length, 57, "existing microservice-only roles must be retained");
  assert.ok(mock.roles.some((role) => role.id === "microservice-only-role"), "the script must not remove existing identities or roles");
  assert.equal(mock.calls.sessionDeletes.length, 28, "only users receiving new grants may have sessions invalidated");
  assert.equal(new Set(mock.calls.sessionDeletes).size, 28, "each changed user must have sessions invalidated once");
  assert.equal(new Set(mock.roles.map(key)).size, 57, "nullable scopes must be compared in memory without duplicate grants");

  const secondApply = await reconcileMonolithOrganizationRoles(mock.prisma as never, raw, true);
  assert.equal(secondApply.missingRoles, 0, "a rerun must find existing nullable-scoped roles in memory");
  assert.equal(secondApply.createdRoles, 0, "a rerun must be idempotent");
  assert.equal(secondApply.invalidatedSessions, 0, "unchanged roles must not invalidate sessions");
  assert.equal(mock.calls.creates, 56);
  assert.equal(mock.calls.sessionDeletes.length, 28);
  assert.equal(mock.calls.modelAccesses.includes("account"), false, "account rows must never be accessed");
  assert.equal(mock.calls.modelAccesses.includes("verification"), false, "verification rows must never be accessed");
  assert.equal(mock.calls.modelAccesses.includes("session"), false, "sessions may only be deleted inside a role-write transaction");

  console.log("Monolith organization role reconciliation checks passed");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
