import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const attendanceController = readFileSync(
  resolve(import.meta.dirname, "../src/attendance/attendance.controller.ts"),
  "utf8",
);

assert.match(
  attendanceController,
  /const REPORT_MANAGER_ROLES = \[[^\]]*"pimpinan"[^\]]*\]/,
  "Foundation leadership must be included only in SIMPEG attendance-report reads",
);
assert.doesNotMatch(
  attendanceController,
  /const HR_ADMIN_ROLES = \[[^\]]*"pimpinan"[^\]]*\]/,
  "Foundation leadership must not inherit SIMPEG HR operational mutations",
);

console.log("SIMPEG Foundation Leader attendance report RBAC contract passed");