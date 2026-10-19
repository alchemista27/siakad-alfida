import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const guardedControllers = [
  "src/academic-years/academic-years.controller.ts",
  "src/classrooms/classrooms.controller.ts",
  "src/subjects/subjects.controller.ts",
  "src/placement/placement.controller.ts",
  "src/teaching/teaching-workflow.controller.ts",
  "src/lhbs/lhbs.controller.ts",
  "src/assignments/assignments.controller.ts",
  "src/schedules/schedules.controller.ts",
  "src/student-development/student-development.controller.ts",
  "src/parent-portal/parent-portal.controller.ts",
  "src/monitoring/monitoring.controller.ts",
  "src/importer/importer.controller.ts",
];

for (const relativePath of guardedControllers) {
  const source = readFileSync(resolve(process.cwd(), relativePath), "utf8");
  assert.match(source, /SiakadRolesGuard/, `${relativePath} must import SiakadRolesGuard`);
  assert.match(source, /SiakadRoles/, `${relativePath} must import SiakadRoles`);
  assert.match(source, /@UseGuards\(SiakadAuthGuard, SiakadRolesGuard\)/, `${relativePath} must apply auth and roles guards`);
  assert.match(source, /@SiakadRoles\(/, `${relativePath} must declare allowed SIAKAD roles`);
}

const authModule = readFileSync(resolve(process.cwd(), "src/auth/auth.module.ts"), "utf8");
assert.match(authModule, /providers:\s*\[SiakadAuthGuard, SiakadRolesGuard\]/, "AuthModule must provide SiakadRolesGuard");
assert.match(authModule, /exports:\s*\[SiakadAuthGuard, SiakadRolesGuard\]/, "AuthModule must export SiakadRolesGuard");

for (const modulePath of ["src/assignments/assignments.module.ts", "src/schedules/schedules.module.ts"]) {
  const source = readFileSync(resolve(process.cwd(), modulePath), "utf8");
  assert.match(source, /imports:\s*\[PrismaModule, AuthModule\]/, `${modulePath} must import AuthModule for controller guards`);
}

console.log("SIAKAD controller RBAC declarations contract passed");
