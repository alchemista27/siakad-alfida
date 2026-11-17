import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../src/dashboard/dashboard.controller.ts"), "utf8");
const start = source.indexOf('@Get("ymq/progress")');
const end = source.indexOf('@Get("ymq/executive/overview")');
assert.ok(start >= 0 && end > start, "Expected GET /dashboard/ymq/progress controller method");
const section = source.slice(start, end);
assert.match(section, /@YmqRoles\("admin_ymq", "pengawas", "pimpinan"\)/);
assert.match(section, /YmqOverallProgressQueryDto/);
assert.match(section, /this\.dashboardService\.overallProgress\(query, req\.user\)/);

console.log("SIYAUM overall progress controller contract passed");
