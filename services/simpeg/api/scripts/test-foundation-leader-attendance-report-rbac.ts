import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const attendanceController = readFileSync(
  resolve(import.meta.dirname, "../src/attendance/attendance.controller.ts"),
  "utf8",
);
const attendanceService = readFileSync(
  resolve(import.meta.dirname, "../src/attendance/attendance.service.ts"),
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
assert.match(
  attendanceService,
  /hasFoundationLeaderRole\(/,
  "Foundation leadership must resolve from the shared canonical predicate",
);
assert.match(
  attendanceService,
  /if \(this\.isGlobalHolidayManager\(principal\) \|\| this\.isFoundationLeader\(principal\)\)/,
  "Foundation leadership must bypass only the unit report-scope restriction",
);

assert.match(
  attendanceController,
  /@Get\("report-units"\)\s*@UseGuards\(SimpegRolesGuard\)\s*@SimpegRoles\(\.\.\.REPORT_MANAGER_ROLES\)/,
  "Attendance report unit catalog must be exposed only to report viewers",
);
assert.match(
  attendanceService,
  /async getAttendanceReportUnits\(principal: Principal\)/,
  "Report viewers need a dedicated canonical unit catalog",
);
assert.match(
  attendanceService,
  /where:\s*\{\s*isActive:\s*true[\s\S]*?orderBy:\s*\{\s*name:\s*"asc"\s*\}/,
  "Report-unit catalog must list active units in canonical order",
);
assert.match(
  attendanceService,
  /if \(this\.isGlobalHolidayManager\(principal\) \|\| this\.isFoundationLeader\(principal\)\) return unitId \? \[unitId\] : undefined;/,
  "Foundation leadership must choose a single unit or the foundation-wide attendance report",
);

console.log("SIMPEG Foundation Leader attendance report RBAC contract passed");