import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const controller = readFileSync(resolve(root, "src/attendance/attendance.controller.ts"), "utf8");

assert.match(controller, /@Get\("report\.pdf"\)/, "PDF report route must exist");
assert.match(controller, /@SimpegRoles\(\.\.\.REPORT_MANAGER_ROLES\)/, "PDF report must retain report-manager RBAC");
assert.match(controller, /attendanceReportPdfExport\.generate\(month, unitId, source, req\.user\)/, "PDF export must use the verified principal and scoped filters");
assert.match(controller, /"Content-Type": "application\/pdf"/, "PDF endpoint must declare its content type");
assert.match(controller, /"Cache-Control": "private, no-store"/, "PDF endpoint must not be cached by shared intermediaries");
assert.match(controller, /"X-Content-Type-Options": "nosniff"/, "PDF endpoint must prevent content-type sniffing");

console.log("SIMPEG attendance report PDF routing contract passed");
