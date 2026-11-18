import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

async function source(relativePath: string) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function main() {
const [guard, periodsController, decisionsController, periodsService, decisionsService] = await Promise.all([
  source("src/common/guards/spmb-roles.guard.ts"),
  source("src/periods/periods.controller.ts"),
  source("src/decisions/decisions.controller.ts"),
  source("src/periods/periods.service.ts"),
  source("src/decisions/decisions.service.ts"),
]);

assert.match(guard, /SpmbDashboardRoles/);
assert.match(guard, /isFoundationLeader/);
assert.match(periodsController, /@SpmbDashboardRoles\(\)\s*\n\s*@SpmbRoles\("admin_unit", "tim_spmb", "observer"\)/);
assert.match(decisionsController, /@SpmbDashboardRoles\(\)\s*\n\s*@SpmbRoles\("admin_unit", "tim_spmb"\)/);
assert.match(periodsService, /isFoundationLeader\(principal\)/);
assert.match(decisionsService, /isFoundationLeader\(principal\)/);
assert.doesNotMatch(periodsController, /@SpmbDashboardRoles\(\)\s*\n\s*@SpmbRoles\("admin_unit"\)\s*\n\s*async create/);
assert.doesNotMatch(decisionsController, /@SpmbDashboardRoles\(\)\s*\n\s*@SpmbRoles\("admin_unit"\)\s*\n\s*async setSingleDecision/);

console.log("SPMB Foundation Leader dashboard RBAC contract passed");
}

void main();
