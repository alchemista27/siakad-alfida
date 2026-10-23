import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const root = resolve(process.cwd());
  const [controller, service, policy] = await Promise.all([
    readFile(resolve(root, "src/attendance/attendance.controller.ts"), "utf8"),
    readFile(resolve(root, "src/attendance/attendance.service.ts"), "utf8"),
    readFile(resolve(root, "src/common/organization-access.policy.ts"), "utf8"),
  ]);

  assert.match(controller, /HOLIDAY_AND_DUTY_MANAGER_ROLES\s*=\s*\[[\s\S]*?"admin_unit"[\s\S]*?"admin_unit_nondik"/, "workday controller must admit scoped unit admins");
  assert.match(service, /private assertCanManageDuty[\s\S]*?canManageUnit\(principal\.roles, unitId\)/, "duty writes must validate the target unit server-side");
  assert.match(service, /app === "simpeg" && \(role === "admin_unit" \|\| role === "admin_unit_nondik"\) && unitId/, "unit scope must come from SIMPEG role claims only");
  assert.match(policy, /app === "simpeg"[\s\S]*?assignedUnitId === unitId/, "organization policy must reject foreign-app or unscoped unit roles");

  console.log("SIMPEG unit-admin Saturday duty authorization contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
