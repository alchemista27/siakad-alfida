import assert from "node:assert/strict";
import { BadGatewayException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { UnitsService } from "../src/units/units.service";

const unitId = "00000000-0000-4000-8000-000000000010";
const otherUnitId = "00000000-0000-4000-8000-000000000011";
const userId = "00000000-0000-4000-8000-000000000012";
const actorId = "00000000-0000-4000-8000-000000000013";
const principal = { id: actorId, roles: [{ app: "simpeg", role: "admin_unit", unitId }] };

function createHarness(category: "pendidikan" | "nondik" = "pendidikan") {
  const assignments = new Map<string, any>();
  const outboxUsers: any[] = [];
  const authRequests: Array<{ url: string; method?: string; body?: any }> = [];
  const unit = { id: unitId, name: "Unit", code: "UNIT", category, isActive: true };
  const keyOf = (where: any) => `${where.unitId}:${where.userId}:${where.app}:${where.role}`;
  const unitAdminAssignment = {
    async findUnique({ where }: any) {
      const key = keyOf(where.unitId_userId_app_role);
      return assignments.get(key) ?? null;
    },
    async findMany() { return [...assignments.values()].filter((entry) => entry.isActive); },
    async upsert({ where, create, update }: any) {
      const key = keyOf(where.unitId_userId_app_role);
      const existing = assignments.get(key);
      const value = existing ? { ...existing, ...update } : { id: `local-${assignments.size + 1}`, ...create };
      assignments.set(key, value);
      return value;
    },
    async update({ where, data }: any) {
      const value = [...assignments.values()].find((entry) => entry.id === where.id);
      if (!value) throw new Error("missing assignment");
      Object.assign(value, data);
      return { ...value };
    },
  };
  const prisma: any = {
    unit: { async findUnique({ where }: any) {
      if (where.id === unitId) return unit;
      if (where.id === otherUnitId) return { ...unit, id: otherUnitId, code: "OTHER" };
      return null;
    } },
    user: { async findUnique({ where }: any) { return where.id === userId ? { id: userId, fullName: "Pegawai Aktif", email: "pegawai@example.test", username: "pegawai", avatarUrl: null, isActive: true, passwordHash: "not-projected" } : null; } },
    unitAdminAssignment,
    async $transaction(callback: any) { return callback({ unitAdminAssignment }); },
  };
  const sync = { async enqueueUser(_tx: any, user: any) { outboxUsers.push(user); } };
  const service = new UnitsService(prisma, sync as any);
  return { service, assignments, outboxUsers, authRequests, prisma };
}

async function main() {
  const originalFetch = globalThis.fetch;
  const originalAuthUrl = process.env.AUTH_API_URL;
  process.env.AUTH_API_URL = "https://auth.example.test";

  try {
    const normal = createHarness();
    globalThis.fetch = (async (input, init) => {
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      normal.authRequests.push({ url: String(input), method: init?.method, body });
      return new Response(JSON.stringify({ id: `auth-${body?.app ?? "revoke"}` }), { status: 200, headers: { "content-type": "application/json" } });
    }) as typeof fetch;

    const assigned = await normal.service.assignAdmin(unitId, { userId, apps: ["siakad", "spmb", "simpeg"] }, principal, "Bearer actor");
    assert.equal(assigned.length, 3);
    assert.deepEqual(normal.authRequests.map(({ url, method, body }) => ({ url, method, body })), [
      { url: "https://auth.example.test/api/users/organization-roles", method: "POST", body: { scope: "unit", userId, unitId, app: "siakad", role: "admin_unit" } },
      { url: "https://auth.example.test/api/users/organization-roles", method: "POST", body: { scope: "unit", userId, unitId, app: "spmb", role: "admin_unit" } },
      { url: "https://auth.example.test/api/users/organization-roles", method: "POST", body: { scope: "unit", userId, unitId, app: "simpeg", role: "admin_unit" } },
    ]);
    assert.equal(normal.outboxUsers.length, 1, "role changes must enqueue one sanitized user projection");
    assert.deepEqual(Object.keys(normal.outboxUsers[0]).sort(), ["avatarUrl", "email", "fullName", "id", "isActive", "username"]);
    assert.equal("passwordHash" in normal.outboxUsers[0], false);

    await normal.service.revokeAdmin(unitId, userId, "spmb", principal, "Bearer actor");
    const revoked = [...normal.assignments.values()].find((entry) => entry.app === "spmb");
    assert.equal(revoked?.isActive, false);
    assert.equal([...normal.assignments.values()].filter((entry) => entry.app !== "spmb").every((entry) => entry.isActive), true, "revoking one app must preserve other assignments");
    const revokeRequest = normal.authRequests.at(-1)!;
    assert.deepEqual(revokeRequest, {
      url: `https://auth.example.test/api/users/organization-roles/${userId}/${unitId}/spmb/admin_unit`,
      method: "DELETE",
      body: undefined,
    }, "revocation must carry the exact user, unit, app, and role scope");

    const nondik = createHarness("nondik");
    let nondikFetches = 0;
    globalThis.fetch = (async () => { nondikFetches += 1; return new Response(JSON.stringify({ id: "auth-nondik" }), { status: 200, headers: { "content-type": "application/json" } }); }) as typeof fetch;
    await assert.rejects(
      () => nondik.service.assignAdmin(unitId, { userId, apps: ["siakad"] }, principal),
      (error: unknown) => error instanceof BadRequestException,
    );
    assert.equal(nondikFetches, 0, "invalid nondik app must fail before Auth is called");
    await nondik.service.assignAdmin(unitId, { userId, apps: ["simpeg"] }, principal);
    assert.equal([...nondik.assignments.values()][0].role, "admin_unit_nondik");

    const failing = createHarness();
    const failingRequests: any[] = [];
    globalThis.fetch = (async (input, init) => {
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      failingRequests.push({ url: String(input), method: init?.method, body });
      if (init?.method === "POST" && body.app === "spmb") return new Response("rejected", { status: 502 });
      return new Response(JSON.stringify({ id: "auth-id" }), { status: 200, headers: { "content-type": "application/json" } });
    }) as typeof fetch;
    await assert.rejects(
      () => failing.service.assignAdmin(unitId, { userId, apps: ["siakad", "spmb"] }, principal),
      (error: unknown) => error instanceof BadGatewayException,
    );
    assert.equal([...failing.assignments.values()].every((entry) => entry.isActive === false), true, "Auth failure must revoke every local assignment created in this request");

    await assert.rejects(
      () => normal.service.assignAdmin(otherUnitId, { userId, apps: ["simpeg"] }, principal),
      (error: unknown) => error instanceof ForbiddenException,
      "scoped unit admins may not grant a different unit",
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalAuthUrl === undefined) delete process.env.AUTH_API_URL;
    else process.env.AUTH_API_URL = originalAuthUrl;
  }

  console.log("Unit admin assignment contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
