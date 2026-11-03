import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../src/attendance/attendance.controller.ts"), "utf8");
assert.match(source, /@Get\("fingerprint\/status"\)[\s\S]*?@UseGuards\(SimpegRolesGuard\)[\s\S]*?@SimpegRoles\(\.\.\.FINGERPRINT_MANAGER_ROLES\)[\s\S]*?getFingerprintStatus/, "fingerprint status route must be role protected");
assert.match(source, /@Post\("fingerprint\/sync"\)[\s\S]*?@Body\(strictValidation\) dto: SyncFingerprintDto[\s\S]*?fingerprintAttendance\.sync\(dto\)/, "manual sync must use strict date DTO");
assert.match(source, /@Put\("fingerprint\/mappings\/:userId"\)[\s\S]*?@Body\(strictValidation\) dto: UpdateFingerprintEnrollmentDto[\s\S]*?updateEnrollment\(userId, dto\.fingerprintEnrollmentId, req\.user\)/, "mapping route must pass verified principal for scope enforcement");
console.log("SIMPEG fingerprint sync routing contract passed");
