import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../src/attendance/attendance.controller.ts"), "utf8");
assert.match(source, /const FINGERPRINT_OPERATOR_ROLES = \["super_admin", "admin_kepegawaian"\];/, "device operations must be restricted to HR/super admin");
assert.match(source, /const FINGERPRINT_MAPPING_ROLES = \[\.\.\.FINGERPRINT_OPERATOR_ROLES, "admin_unit", "admin_unit_nondik"\];/, "unit admins may only retain explicit mapping access");
assert.match(source, /@Get\("fingerprint\/status"\)[\s\S]*?@SimpegRoles\(\.\.\.FINGERPRINT_OPERATOR_ROLES\)[\s\S]*?getFingerprintStatus/, "fingerprint status must be HR-only");
assert.match(source, /@Post\("fingerprint\/sync"\)[\s\S]*?@SimpegRoles\(\.\.\.FINGERPRINT_OPERATOR_ROLES\)[\s\S]*?fingerprintAttendance\.sync\(dto\)/, "manual sync must be HR-only and use strict date DTO");
assert.match(source, /@Get\("fingerprint\/unmatched"\)[\s\S]*?@SimpegRoles\(\.\.\.FINGERPRINT_OPERATOR_ROLES\)[\s\S]*?getUnmatchedFingerprintEvents/, "unmatched events must be HR-only while they cannot be safely unit scoped");
assert.match(source, /@Put\("fingerprint\/mappings\/:userId"\)[\s\S]*?@SimpegRoles\(\.\.\.FINGERPRINT_MAPPING_ROLES\)[\s\S]*?updateEnrollment\(userId, dto\.fingerprintEnrollmentId, req\.user\)/, "mapping must pass the verified principal for service-side unit scope enforcement");
assert.match(source, /getAttendanceDashboard\([\s\S]*?@Query\("source"\) source: string \| undefined,[\s\S]*?getAttendanceDashboardReport\(month, unitId, req\.user, undefined, source\)/, "dashboard must pass source filtering into the scoped service");
assert.match(source, /getRecap\([\s\S]*?@Query\("source"\) source: string \| undefined,[\s\S]*?getAttendanceRecap\(startDate, endDate, unitId, req\.user, source\)/, "recap must use principal-aware source filtering");
console.log("SIMPEG fingerprint sync routing contract passed");
