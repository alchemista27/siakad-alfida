import assert from "node:assert/strict";
import { GroupStaffService } from "../src/group-staff/group-staff.service";
import { AuthYmqRoleBrokerClient } from "../src/group-staff/auth-ymq-role-broker.client";

const ids = {
  admin: "11111111-1111-4111-8111-111111111111",
  employee: "22222222-2222-4222-8222-222222222222",
  group: "33333333-3333-4333-8333-333333333333",
};
const principal = { id: ids.admin, roles: [{ app: "siyaum", role: "admin_ymq" }] };

const brokerCalls: Array<{ kind: string; role: string }> = [];
const broker = {
  assign: async (_actorId: string, _targetUserId: string, role: string) => { brokerCalls.push({ kind: "assign", role }); return { changed: true }; },
  revoke: async (_actorId: string, _targetUserId: string, role: string) => { brokerCalls.push({ kind: "revoke", role }); },
};
const prisma = {
  ymqGroup: { findUnique: async () => ({ id: ids.group, pembinaUserId: null, groupAdmins: [] }) },
  user: { findUnique: async () => ({ id: ids.employee, isActive: true, sourceUpdatedAt: new Date("2026-10-22T00:00:00.000Z") }) },
  ymqGroupAdminAssignment: { count: async () => 0 },
  $transaction: async () => { throw new Error("local write failed"); },
};
async function main() {
  const service = new GroupStaffService(prisma as any, broker as any);
  await assert.rejects(() => service.assignPembina(ids.group, ids.employee, principal));
  assert.deepEqual(brokerCalls, [
    { kind: "assign", role: "pembina_ymq" },
    { kind: "revoke", role: "pembina_ymq" },
  ]);
  await assert.rejects(() => service.assignGroupAdmin(ids.group, ids.employee, { id: "other", roles: [] }));

  const existingRoleCalls: string[] = [];
  const existingRoleService = new GroupStaffService(prisma as any, {
    assign: async () => { existingRoleCalls.push("assign"); return { changed: false }; },
    revoke: async () => { existingRoleCalls.push("revoke"); },
  } as any);
  await assert.rejects(() => existingRoleService.assignPembina(ids.group, ids.employee, principal));
  assert.deepEqual(existingRoleCalls, ["assign"], "a failed local assignment must not revoke an Auth role that already existed for another group");

  process.env.AUTH_INTERNAL_API_URL = "https://auth.internal.test";
  process.env.INTERNAL_SERVICE_SECRET = "test-secret";
  const requests: Array<{ url: URL; init: RequestInit }> = [];
  const client = new AuthYmqRoleBrokerClient(async (url, init) => {
    requests.push({ url: new URL(typeof url === "string" ? url : url.toString()), init: init ?? {} });
    return new Response("{}", { status: 200, headers: { "content-type": "application/json" } });
  });
  await client.revoke(ids.admin, ids.employee, "admin_kelompok");
  assert.equal(requests[0].url.pathname, `/api/internal/ymq-role-broker/users/${ids.employee}/roles/admin_kelompok`);
  assert.deepEqual(JSON.parse(String(requests[0].init.body)), { actorUserId: ids.admin });

  console.log("SIYAUM YMQ group staff assignment contract passed");
}

main();
