import assert from "node:assert/strict";
import "reflect-metadata";
import { DepartmentsService } from "../src/departments/departments.service";
import { OrganizationSyncService } from "../src/organization-sync/organization-sync.service";

const department = { id: "00000000-0000-4000-8000-000000000101", name: "Bidang Akademik", code: "AKD", description: null, isActive: true, updatedAt: new Date("2026-10-16T00:00:00.000Z") };
const assignment = { id: "00000000-0000-4000-8000-000000000102", userId: "00000000-0000-4000-8000-000000000103", departmentId: department.id, role: "admin_bidang", isActive: true, authAssignmentId: "00000000-0000-4000-8000-000000000104" };
const events: any[] = [];
let deleted = false;
const prisma = {
  department: {
    async findUnique() { return deleted ? null : department; },
  },
  departmentAdminAssignment: {
    async findMany() { return [assignment]; },
  },
  async $transaction(callback: any) {
    return callback({
      department: { async delete() { deleted = true; return department; } },
      departmentAdminAssignment: { async updateMany({ data }: any) { Object.assign(assignment, data); return { count: 1 }; } },
      organizationSyncOutbox: { async upsert(input: any) { events.push(input.create); return input.create; } },
    });
  },
};

async function main() {
  const originalFetch = globalThis.fetch;
  const originalAuthApiUrl = process.env.AUTH_API_URL;
  process.env.AUTH_API_URL = "https://auth.example.test";
  const requests: Array<{ url: string; method?: string }> = [];
  globalThis.fetch = (async (url, init) => {
    requests.push({ url: String(url), method: init?.method });
    return new Response("{}", { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;

  try {
    const service = new DepartmentsService(prisma as any, new OrganizationSyncService());
    await service.remove(department.id, "00000000-0000-4000-8000-000000000105", "Bearer caller");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalAuthApiUrl === undefined) delete process.env.AUTH_API_URL;
    else process.env.AUTH_API_URL = originalAuthApiUrl;
  }

  assert.equal(deleted, true, "department deletion must hard-delete only after Auth revocation succeeds");
  assert.equal(assignment.isActive, false, "department deletion must revoke every active local assignment");
  assert.deepEqual(requests, [{ url: `https://auth.example.test/api/users/organization-roles/${assignment.userId}/${department.id}`, method: "DELETE" }]);
  assert.equal(events.length, 1);
  assert.equal(events[0].eventType, "department.deleted");
  assert.deepEqual(events[0].payload, { id: department.id, deletedAt: events[0].payload.deletedAt });
  assert.match(events[0].payload.deletedAt, /^\d{4}-\d{2}-\d{2}T/);
  console.log("Department deletion contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
