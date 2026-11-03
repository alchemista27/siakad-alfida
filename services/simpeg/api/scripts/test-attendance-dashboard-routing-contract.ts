import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../src/attendance/attendance.controller.ts"), "utf8");

assert.match(source, /const REPORT_MANAGER_ROLES\s*=\s*\[[\s\S]*?"super_admin"[\s\S]*?"admin_kepegawaian"[\s\S]*?"admin_unit"[\s\S]*?"admin_unit_nondik"/, "attendance report route must admit global and scoped SIMPEG managers");
assert.match(source, /@Get\("dashboard"\)[\s\S]*?@UseGuards\(SimpegRolesGuard\)[\s\S]*?@SimpegRoles\(\.\.\.REPORT_MANAGER_ROLES\)[\s\S]*?getAttendanceDashboard\([\s\S]*?@Req\(\) req: any[\s\S]*?getAttendanceDashboardReport\(month, unitId, req\.user\)/, "attendance dashboard route must pass the verified principal to service scope enforcement");

console.log("SIMPEG attendance dashboard routing contract passed");
