import assert from "node:assert/strict";
import "reflect-metadata";

import { DepartmentsService } from "../src/departments/departments.service";
import { SIMPEG_ROLES_KEY, SimpegRolesGuard } from "../src/common/guards/simpeg-roles.guard";
import { OrganizationSyncController } from "../src/organization-sync/organization-sync.controller";
import { OrganizationSyncProcessor } from "../src/organization-sync/organization-sync.processor";
import { OrganizationSyncService } from "../src/organization-sync/organization-sync.service";

async function main() {
const user = {
  id: "00000000-0000-4000-8000-000000000001",
  fullName: "Pegawai Aktif",
  email: "pegawai@example.test",
  username: "pegawai",
  avatarUrl: "https://assets.example.test/avatar.png",
  isActive: true,
  passwordHash: "must-not-leak",
};
const department = { id: "00000000-0000-4000-8000-000000000002", isActive: true };
const outboxEvents: any[] = [];
const assignment = { id: "00000000-0000-4000-8000-000000000003", authAssignmentId: null, isActive: true };
const assignments = {
  async upsert() { return assignment; },
  async update({ data }: any) { Object.assign(assignment, data); return { ...assignment }; },
  async findUnique() { return { ...assignment }; },
};
const outbox = {
  async upsert(input: any) { outboxEvents.push(input); return input.create; },
};
const prisma = {
  department: { async findUnique() { return department; } },
  user: { async findUnique() { return user; } },
  departmentAdminAssignment: assignments,
  async $transaction(callback: any) { return callback({ departmentAdminAssignment: assignments, organizationSyncOutbox: outbox }); },
};
const originalFetch = globalThis.fetch;
const authRequests: Array<{ url: string; method: string | undefined }> = [];
globalThis.fetch = (async (input, init) => {
  authRequests.push({ url: String(input), method: init?.method });
  return new Response(JSON.stringify({ id: "00000000-0000-4000-8000-000000000004" }), { status: 200, headers: { "content-type": "application/json" } });
}) as typeof fetch;
const originalAuthApiUrl = process.env.AUTH_API_URL;
process.env.AUTH_API_URL = "https://auth.example.test";

try {
  const departments = new DepartmentsService(prisma as any, new OrganizationSyncService());
  await departments.assignAdmin(department.id, user.id, "00000000-0000-4000-8000-000000000005");
  await departments.revokeAdmin(department.id, user.id, "00000000-0000-4000-8000-000000000005");
} finally {
  globalThis.fetch = originalFetch;
  if (originalAuthApiUrl === undefined) delete process.env.AUTH_API_URL;
  else process.env.AUTH_API_URL = originalAuthApiUrl;
}

assert.equal(outboxEvents.length, 2, "department assignment and revocation must each enqueue a User projection event");
assert.deepEqual(authRequests, [
  { url: `https://auth.example.test/api/users/organization-roles`, method: "POST" },
  { url: `https://auth.example.test/api/users/organization-roles/${user.id}/${department.id}`, method: "DELETE" },
], "SIMPEG must use the browser role endpoint only for admin_bidang grant and revoke");
for (const event of outboxEvents) {
  assert.equal(event.create.aggregate, "user");
  assert.equal(event.create.eventType, "user.projected");
  assert.deepEqual(Object.keys(event.create.payload).sort(), ["avatarUrl", "email", "fullName", "id", "isActive", "username"]);
  assert.equal("passwordHash" in event.create.payload, false, "User projection event must not contain passwordHash");
}

const retryRoles = Reflect.getMetadata(SIMPEG_ROLES_KEY, OrganizationSyncController.prototype.retry);
assert.deepEqual(retryRoles, ["super_admin", "admin_kepegawaian"], "manual outbox retry must require super_admin or admin_kepegawaian explicitly");

const retryGuard = new SimpegRolesGuard({ getAllAndOverride: () => retryRoles } as any);
const contextFor = (roles: any[]) => ({
  getHandler: () => OrganizationSyncController.prototype.retry,
  getClass: () => OrganizationSyncController,
  switchToHttp: () => ({ getRequest: () => ({ user: { roles } }) }),
}) as any;
assert.equal(retryGuard.canActivate(contextFor([{ app: "simpeg", role: "admin_kepegawaian" }])), true);
assert.equal(retryGuard.canActivate(contextFor([{ app: "*", role: "super_admin" }])), true);
assert.throws(() => retryGuard.canActivate(contextFor([{ app: "simpeg", role: "admin_bidang" }])), /Akses ditolak/);
assert.throws(() => retryGuard.canActivate(contextFor(["admin_kepegawaian"])), /Akses ditolak/, "unscoped string roles must not authorize administrative retry");

const staleRow: any = {
  id: "00000000-0000-4000-8000-000000000006",
  aggregate: "user",
  aggregateId: user.id,
  eventType: "user.projected",
  payload: { id: user.id },
  status: "processing",
  attemptCount: 1,
  availableAt: new Date(Date.now() - 1_000),
  createdAt: new Date(Date.now() - 5_000),
};
const processorUpdates: Array<{ where: any; data: any; count: number }> = [];
const processorOutbox = {
  async updateMany({ where, data }: any) {
    let matches = false;
    if (!where.id || where.id === staleRow.id) {
      const statusMatches = where.status === "processing"
        ? staleRow.status === "processing"
        : Array.isArray(where.status?.in)
          ? where.status.in.includes(staleRow.status)
          : staleRow.status === where.status;
      const availabilityMatches = where.availableAt?.lte instanceof Date
        ? staleRow.availableAt <= where.availableAt.lte
        : where.availableAt instanceof Date
          ? staleRow.availableAt.getTime() === where.availableAt.getTime()
          : true;
      matches = statusMatches && availabilityMatches;
    }
    if (matches) Object.assign(staleRow, data);
    processorUpdates.push({ where, data, count: matches ? 1 : 0 });
    return { count: matches ? 1 : 0 };
  },
  async findMany() {
    return ["pending", "failed"].includes(staleRow.status) && staleRow.availableAt <= new Date() ? [{ ...staleRow }] : [];
  },
  async update({ data }: any) { Object.assign(staleRow, data); return { ...staleRow }; },
};
const delivered: any[] = [];
const processor = new OrganizationSyncProcessor({ organizationSyncOutbox: processorOutbox } as any, { async deliver(row: any) { delivered.push(row); } } as any);
await processor.processBatch();
assert.equal(delivered.length, 1, "expired processing lease must be recovered and redelivered");
assert.equal(staleRow.status, "delivered");
assert.ok(processorUpdates.some((update) => update.where.status === "processing" && update.data.status === "failed"), "expired processing rows must be returned to a retryable state before delivery");

console.log("Organization sync outbox contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
