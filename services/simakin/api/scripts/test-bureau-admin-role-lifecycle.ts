import assert from "node:assert/strict";

import { BureauAdminRoleLifecycle } from "../src/strategic/organization-role-broker/bureau-admin-role-lifecycle";

async function main() {
const lifecycle = new BureauAdminRoleLifecycle();
const local = { created: false, removed: false, authAssignmentId: null as string | null };
const grant = await lifecycle.assign({
  createLocal: async () => { local.created = true; },
  removeLocal: async () => { local.removed = true; },
  grantAuth: async () => "auth-assignment-1",
  persistAuthAssignment: async (id) => { local.authAssignmentId = id; },
});
assert.equal(grant, "auth-assignment-1", "PASS: assigning Admin Biro writes local DepartmentAdmin and Auth simakin:admin_biro scope");
assert.equal(local.authAssignmentId, "auth-assignment-1");
await assert.rejects(() => lifecycle.assign({ createLocal: async () => undefined, removeLocal: async () => { local.removed = true; }, grantAuth: async () => { throw new Error("unavailable"); }, persistAuthAssignment: async () => undefined }));
assert.equal(local.removed, true, "PASS: Auth failure rolls back the local Admin Biro mutation");
const compensationCalls: string[] = [];
await assert.rejects(() => lifecycle.assign({
  createLocal: async () => { compensationCalls.push("local-create"); },
  removeLocal: async () => { compensationCalls.push("local-remove"); },
  grantAuth: async () => { compensationCalls.push("auth-grant"); return "auth-assignment-2"; },
  revokeAuth: async (id: string) => { compensationCalls.push(`auth-revoke:${id}`); },
  persistAuthAssignment: async () => { throw new Error("local persistence unavailable"); },
} as any));
assert.deepEqual(compensationCalls, ["local-create", "auth-grant", "auth-revoke:auth-assignment-2", "local-remove"], "FAIL: local persistence failure compensates a granted Auth role before removing local state");
const calls: string[] = [];
await lifecycle.revoke({ revokeAuth: async () => { calls.push("auth"); }, removeLocal: async () => { calls.push("local"); } });
assert.deepEqual(calls, ["auth", "local"], "PASS: revoking Admin Biro revokes Auth scope before local relation is removed");
console.log("Bureau admin role lifecycle contract passed");
}

main().catch((error: unknown) => { throw error; });
