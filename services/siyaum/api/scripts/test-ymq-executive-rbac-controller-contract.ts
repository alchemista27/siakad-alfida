import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../src/dashboard/dashboard.controller.ts"), "utf8");
const executiveRoutes = source.match(/@Get\("ymq\/executive\/[^"]+"\)\n\s*@YmqRoles\(([^)]*)\)/g) || [];
assert.equal(executiveRoutes.length, 3, "All executive endpoints must declare their role boundary");
for (const route of executiveRoutes) {
  assert.match(route, /@YmqRoles\("pengawas", "pimpinan"\)/, "Executive endpoints must permit only Pengawas and Pimpinan, plus global Super Admin through the guard");
  assert.doesNotMatch(route, /admin_ymq/, "Admin YMQ must not call executive report endpoints");
}

console.log("SIYAUM executive RBAC controller contract passed");
