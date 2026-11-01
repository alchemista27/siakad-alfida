import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { METHOD_METADATA, MODULE_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { RequestMethod } from "@nestjs/common/enums/request-method.enum";
import { AppModule } from "../src/app.module";
import { YmqRosterBrokerController } from "../src/ymq-roster-broker/ymq-roster-broker.controller";
import { YmqRosterBrokerModule } from "../src/ymq-roster-broker/ymq-roster-broker.module";
import {
  validateYmqRosterPreviewInput,
  validateYmqRosterProvisionInput,
} from "../src/ymq-roster-broker/ymq-roster-broker.policy";
import { YmqRosterBrokerService } from "../src/ymq-roster-broker/ymq-roster-broker.service";

const actorUserId = "00000000-0000-4000-8000-000000000001";
const unitId = "00000000-0000-4000-8000-000000000002";

const standardAccount = {
  sourceKey: "ymq:001",
  fullName: "Murid YMQ",
  email: "murid.ymq@alfida.or.id",
  assignments: [
    { app: "simpeg" as const, role: "pegawai" as const, unitId },
    { app: "siyaum" as const, role: "peserta" as const, unitId: null },
  ],
};

function previewInput(accounts = [standardAccount]) {
  return { actorUserId, rosterVersion: "ymq-2026-2027" as const, accounts };
}

function provisionInput(accounts = [standardAccount]) {
  return { ...previewInput(accounts), initialPassword: "contract-only-not-a-real-password" };
}

type Role = { id?: string; userId: string; app: string; role: string; unitId: string | null; departmentId: string | null };
type User = {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date | null;
  roles: Role[];
};

function createPrisma(options: {
  actorActive?: boolean;
  actorRoles?: Array<{ app: string; role: string }>;
  users?: User[];
} = {}) {
  let users = [...(options.users ?? [])];
  let roles = users.flatMap((user) => user.roles);
  const createdAccounts: Array<Record<string, unknown>> = [];
  let transactions = 0;
  let sessionsCleared = 0;

  const tx = {
    user: {
      create: async ({ data }: { data: Record<string, any> }) => {
        const user: User = {
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          isActive: data.isActive ?? true,
          passwordHash: data.passwordHash,
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: null,
          roles: [],
        };
        users.push(user);
        const account = data.accounts?.create;
        if (account) createdAccounts.push({ ...account, userId: user.id });
        return { ...user, roles: [] };
      },
      findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
        if (where.id === actorUserId) {
          return {
            id: actorUserId,
            fullName: "Super Admin",
            email: "super.admin@alfida.or.id",
            isActive: options.actorActive ?? true,
            roles: (options.actorRoles ?? [{ app: "auth", role: "super_admin" }]).map((role) => ({
              id: `actor-${role.app}-${role.role}`,
              userId: actorUserId,
              ...role,
              unitId: null,
              departmentId: null,
            })),
          };
        }
        const user = users.find((entry) => entry.id === where.id || entry.email === where.email);
        return user ? { ...user, roles: roles.filter((role) => role.userId === user.id) } : null;
      },
    },
    roleAssignment: {
      findFirst: async ({ where }: { where: Partial<Role> }) => (
        roles.find((role) => Object.entries(where).every(([key, value]) => role[key as keyof Role] === value)) ?? null
      ),
      create: async ({ data }: { data: Role }) => {
        const created = { ...data };
        roles.push(created);
        return created;
      },
    },
    session: {
      deleteMany: async ({ where }: { where: { userId: string } }) => {
        sessionsCleared += 1;
        return { count: where.userId ? 1 : 0 };
      },
    },
  };

  const prisma = {
    user: {
      findUnique: tx.user.findUnique,
    },
    $transaction: async <T>(operation: (transaction: typeof tx) => Promise<T>) => {
      transactions += 1;
      return operation(tx);
    },
  };

  return {
    prisma,
    users: () => users,
    roles: () => roles,
    createdAccounts: () => createdAccounts,
    transactions: () => transactions,
    sessionsCleared: () => sessionsCleared,
  };
}

async function main() {
  assert.deepEqual(validateYmqRosterPreviewInput(previewInput()), previewInput());
  assert.deepEqual(validateYmqRosterProvisionInput(provisionInput()), provisionInput());
  assert.throws(
    () => validateYmqRosterPreviewInput({ ...previewInput(), unexpected: true }),
    BadRequestException,
    "preview must reject unknown keys",
  );
  assert.throws(
    () => validateYmqRosterProvisionInput({ ...provisionInput(), accounts: new Array(501).fill(standardAccount) }),
    BadRequestException,
    "roster size must be bounded",
  );

  const unauthorized = new YmqRosterBrokerService(createPrisma({ actorRoles: [{ app: "siyaum", role: "admin_ymq" }] }).prisma as any);
  await assert.rejects(() => unauthorized.preview(previewInput()), ForbiddenException, "only global Super Admin may preview");

  const previewState = createPrisma();
  const preview = await new YmqRosterBrokerService(previewState.prisma as any).preview(previewInput());
  assert.deepEqual(preview.accounts[0].status, "created");
  assert.equal(previewState.transactions(), 0, "preview must not start a write transaction");
  assert.equal(previewState.users().length, 0, "preview must not create users");
  assert.equal(previewState.roles().length, 0, "preview must not create roles");

  const newState = createPrisma();
  const provisioned = await new YmqRosterBrokerService(newState.prisma as any).provision(provisionInput());
  assert.equal(provisioned.accounts.length, 1);
  assert.equal(newState.users().length, 1);
  assert.equal(newState.createdAccounts().length, 1, "new users must get a credential account");
  assert.equal(newState.createdAccounts()[0].providerId, "credential");
  assert.equal(newState.createdAccounts()[0].password, newState.users()[0].passwordHash, "credential password must match User.passwordHash");
  assert.deepEqual(
    newState.roles().map((role) => [role.app, role.role, role.unitId]),
    [["simpeg", "pegawai", unitId], ["siyaum", "peserta", null]],
    "standard roster roles must preserve prerequisite order",
  );

  const existing: User = {
    id: "00000000-0000-4000-8000-000000000010",
    fullName: "Murid YMQ",
    email: standardAccount.email,
    isActive: true,
    passwordHash: "existing-password-hash",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-02T00:00:00.000Z"),
    roles: [],
  };
  const existingState = createPrisma({ users: [existing] });
  const existingResult = await new YmqRosterBrokerService(existingState.prisma as any).provision(provisionInput());
  assert.equal(existingResult.accounts[0].id, existing.id);
  assert.equal(existingState.users()[0].passwordHash, "existing-password-hash", "existing passwords must not be reset");
  assert.equal(existingState.createdAccounts().length, 0, "existing users must not get a replacement credential account");
  assert.equal(existingState.sessionsCleared(), 1, "existing users with changed roles must lose sessions");

  const conflictState = createPrisma({ users: [{ ...existing, fullName: "Other Person", email: standardAccount.email }] });
  const conflictService = new YmqRosterBrokerService(conflictState.prisma as any);
  const conflictBatch = provisionInput([
    standardAccount,
    { ...standardAccount, sourceKey: "ymq:002", email: "another.ymq@alfida.or.id" },
  ]);
  await assert.rejects(() => conflictService.provision(conflictBatch), BadRequestException, "existing-email name conflicts must block the batch");
  assert.equal(conflictState.transactions(), 0, "a conflict must block all writes");
  assert.equal(conflictState.users().length, 1, "a conflict must not create later accounts");

  const pembinaState = createPrisma();
  await new YmqRosterBrokerService(pembinaState.prisma as any).provision(provisionInput([{
    ...standardAccount,
    assignments: [
      { app: "siyaum", role: "pembina_ymq", unitId: null },
      { app: "siyaum", role: "peserta", unitId: null },
      { app: "simpeg", role: "pegawai", unitId },
    ],
  }]));
  assert.deepEqual(
    pembinaState.roles().map((role) => `${role.app}:${role.role}`),
    ["simpeg:pegawai", "siyaum:peserta", "siyaum:pembina_ymq"],
    "pembina provisioning must add prerequisites first",
  );

  const adminState = createPrisma();
  await new YmqRosterBrokerService(adminState.prisma as any).provision(provisionInput([{
    sourceKey: "ymq:admin",
    fullName: "Admin YMQ",
    email: "admin.siyaum@alfida.or.id",
    assignments: [{ app: "siyaum", role: "admin_ymq", unitId: null }],
  }]));
  assert.deepEqual(adminState.roles().map((role) => `${role.app}:${role.role}`), ["siyaum:admin_ymq"]);

  const sutrisnoState = createPrisma();
  await new YmqRosterBrokerService(sutrisnoState.prisma as any).provision(provisionInput([{
    sourceKey: "ymq:sutrisno",
    fullName: "Sutrisno",
    email: "sutrisno@alfida.or.id",
    assignments: [
      { app: "simpeg", role: "pimpinan", unitId: null },
      { app: "siyaum", role: "peserta", unitId: null },
    ],
  }]));
  assert.deepEqual(sutrisnoState.roles().map((role) => `${role.app}:${role.role}`), ["simpeg:pimpinan", "siyaum:peserta"]);
  assert.equal(sutrisnoState.roles().some((role) => role.app === "siyaum" && role.role === "pimpinan"), false);
  assert.equal(sutrisnoState.roles().some((role) => role.app === "simpeg" && role.role === "pegawai"), false);

  await assert.rejects(
    () => new YmqRosterBrokerService(createPrisma().prisma as any).preview(previewInput([{ ...standardAccount }, { ...standardAccount }])),
    BadRequestException,
    "duplicate source keys and normalized emails must be rejected",
  );

  const serialized = JSON.stringify(provisioned);
  assert.doesNotMatch(serialized, /initialPassword|passwordHash|contract-only-not-a-real-password/i);
  assert.doesNotMatch(readFileSync(join(process.cwd(), "src/ymq-roster-broker/ymq-roster-broker.service.ts"), "utf8"), /console\.(?:log|warn|error)/);

  const appImports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule) as unknown[];
  assert.ok(appImports.includes(YmqRosterBrokerModule), "AppModule must register the YMQ roster broker routes");
  assert.equal(Reflect.getMetadata(PATH_METADATA, YmqRosterBrokerController), "internal/ymq-roster-broker");
  assert.equal(Reflect.getMetadata(PATH_METADATA, YmqRosterBrokerController.prototype.preview), "preview");
  assert.equal(Reflect.getMetadata(METHOD_METADATA, YmqRosterBrokerController.prototype.preview), RequestMethod.POST);
  assert.equal(Reflect.getMetadata(PATH_METADATA, YmqRosterBrokerController.prototype.provision), "provision");
  assert.equal(Reflect.getMetadata(METHOD_METADATA, YmqRosterBrokerController.prototype.provision), RequestMethod.POST);

  const calls: Array<{ method: string; input: unknown }> = [];
  const controller = new YmqRosterBrokerController({
    preview: async (input: unknown) => { calls.push({ method: "preview", input }); return { accounts: [] }; },
    provision: async (input: unknown) => { calls.push({ method: "provision", input }); return { accounts: [] }; },
  } as any);
  await controller.preview(previewInput());
  await controller.provision(provisionInput());
  assert.deepEqual(calls, [
    { method: "preview", input: previewInput() },
    { method: "provision", input: provisionInput() },
  ]);

  console.log("YMQ roster broker contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
