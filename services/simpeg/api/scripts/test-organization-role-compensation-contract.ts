import assert from "node:assert/strict";
import { BadGatewayException } from "@nestjs/common";
import { DepartmentsService } from "../src/departments/departments.service";
import { OrganizationSyncProcessor } from "../src/organization-sync/organization-sync.processor";
import { OrganizationSyncService } from "../src/organization-sync/organization-sync.service";
import { UnitsService } from "../src/units/units.service";

const unitId = "00000000-0000-4000-8000-000000000201";
const departmentId = "00000000-0000-4000-8000-000000000202";
const userId = "00000000-0000-4000-8000-000000000203";
const actorId = "00000000-0000-4000-8000-000000000204";
const authAssignmentId = "00000000-0000-4000-8000-000000000205";
const user = {
  id: userId,
  fullName: "Pegawai Aktif",
  email: "pegawai@example.test",
  username: "pegawai",
  avatarUrl: null,
  isActive: true,
  updatedAt: new Date("2026-10-18T10:00:00.000Z"),
};

function createHarness(scope: "unit" | "department") {
  const local = { id: `local-${scope}`, userId, unitId, departmentId, app: scope === "unit" ? "simpeg" : "simakin", role: scope === "unit" ? "admin_unit" : "admin_bidang", isActive: true, authAssignmentId: null as string | null };
  const reconciliations = new Map<string, any>();
  let failAuthIdPersistence = true;

  const localStore = {
    async findUnique() { return { ...local }; },
    async upsert({ create, update }: any) { Object.assign(local, local.isActive ? update : create); return { ...local }; },
    async update({ data }: any) {
      if (data.authAssignmentId && failAuthIdPersistence) {
        failAuthIdPersistence = false;
        throw new Error("local write failed after Auth grant");
      }
      Object.assign(local, data);
      return { ...local };
    },
    async updateMany({ data }: any) { Object.assign(local, data); return { count: 1 }; },
  };
  const compensationStore = {
    async upsert({ where, create, update }: any) {
      const existing = reconciliations.get(where.idempotencyKey);
      const value = existing ? { ...existing, ...update } : { id: `compensation-${scope}`, ...create };
      reconciliations.set(where.idempotencyKey, value);
      return { ...value };
    },
    async update({ where, data }: any) {
      const value = [...reconciliations.values()].find((row) => row.id === where.id);
      if (!value) throw new Error("missing reconciliation");
      Object.assign(value, data);
      return { ...value };
    },
    async updateMany({ where, data }: any) {
      const value = [...reconciliations.values()].find((row) => row.id === where.id);
      if (!value || (where.status && value.status !== where.status)) return { count: 0 };
      Object.assign(value, data);
      return { count: 1 };
    },
    async findMany() {
      return [...reconciliations.values()].filter((row) => ["armed", "pending", "failed"].includes(row.status));
    },
  };
  const tx = {
    unitAdminAssignment: localStore,
    departmentAdminAssignment: localStore,
    authRoleCompensation: compensationStore,
    organizationSyncOutbox: { async upsert() { return {}; } },
  };
  const prisma: any = {
    unit: { async findUnique() { return { id: unitId, name: "Unit", code: "UNIT", category: "pendidikan", isActive: true }; } },
    department: { async findUnique() { return { id: departmentId, name: "Bidang", code: "BDG", isActive: true }; } },
    user: { async findUnique() { return user; } },
    unitAdminAssignment: localStore,
    departmentAdminAssignment: localStore,
    authRoleCompensation: compensationStore,
    organizationSyncOutbox: { async findMany() { return []; }, async updateMany() { return { count: 0 }; } },
    async $transaction(callback: any) { return callback(tx); },
  };
  return { prisma, local, reconciliations };
}

async function assertCompensation(scope: "unit" | "department") {
  const harness = createHarness(scope);
  let failImmediateRevoke = true;
  const retried: Array<Record<string, unknown>> = [];
  const authOrganizationRoles = {
    async grant() { return { id: authAssignmentId }; },
    async revoke(input: Record<string, unknown>) {
      if (failImmediateRevoke) throw new Error("revoke unavailable");
      retried.push(input);
    },
  };

  const sync = new OrganizationSyncService();
  const service = scope === "unit"
    ? new UnitsService(harness.prisma, sync, authOrganizationRoles as any)
    : new DepartmentsService(harness.prisma, sync, authOrganizationRoles as any);
  await assert.rejects(
    () => scope === "unit"
      ? (service as UnitsService).assignAdmin(unitId, { userId, apps: ["simpeg"] }, { id: actorId, roles: [{ app: "simpeg", role: "admin_unit", unitId }] })
      : (service as DepartmentsService).assignAdmin(departmentId, userId, actorId),
    (error: unknown) => error instanceof BadGatewayException,
  );

  const record = [...harness.reconciliations.values()][0];
  assert.ok(record, `${scope}: compensation must be durably armed before the Auth grant`);
  assert.equal(record.authAssignmentId, authAssignmentId, `${scope}: granted Auth assignment ID must be persisted for recovery`);
  assert.equal(record.status, "pending", `${scope}: failed immediate revoke must remain pending for reconciliation`);

  failImmediateRevoke = false;
  const processor = new OrganizationSyncProcessor(
    harness.prisma,
    { async deliver() { throw new Error("unexpected organization projection"); } } as any,
    undefined,
    authOrganizationRoles as any,
  );
  await processor.processBatch();
  assert.deepEqual(retried, [
    scope === "unit"
      ? { scope: "unit", userId, unitId, app: "simpeg", role: "admin_unit" }
      : { scope: "department", userId, departmentId, app: "simakin", role: "admin_bidang" },
  ], `${scope}: reconciler must use the generic Auth organization-role payload`);
  assert.equal(record.status, "delivered", `${scope}: successful reconciliation must close the durable record`);
  assert.equal(harness.local.isActive, false, `${scope}: recovered revocation must leave the local assignment inactive`);
}

async function main() {
  await assertCompensation("unit");
  await assertCompensation("department");
  console.log("Organization role compensation contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
