import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  hasSimpegManagementAccess,
  isPegawaiRole,
  canViewSimpegAttendanceReports,
  canSelectFoundationAttendanceReportScope,
  simpegLandingTab,
} from "../src/lib/simpeg-access";

assert.equal(hasSimpegManagementAccess([{ app: "simpeg", role: "pegawai" }]), false);
assert.equal(isPegawaiRole([{ app: "simpeg", role: "pegawai" }]), true);
assert.equal(simpegLandingTab([{ app: "simpeg", role: "pegawai" }]), "attendance");
assert.equal(hasSimpegManagementAccess([{ app: "simpeg", role: "admin_unit", unitId: "unit-a" }]), true);
assert.equal(simpegLandingTab([{ app: "simpeg", role: "admin_unit", unitId: "unit-a" }]), "reports");
assert.equal(simpegLandingTab([{ app: "simpeg", role: "pegawai" }, { app: "simpeg", role: "admin_kepegawaian" }]), "reports");
assert.equal(canViewSimpegAttendanceReports([{ app: "simpeg", role: "admin_bidang" }]), false);
assert.equal(simpegLandingTab([{ app: "simpeg", role: "admin_bidang" }]), "assignments");
assert.equal(canViewSimpegAttendanceReports([{ app: "simpeg", role: "pimpinan" }]), true, "Foundation leadership must read SIMPEG attendance reporting");
assert.equal(simpegLandingTab([{ app: "simpeg", role: "pimpinan" }]), "reports", "Foundation leadership must land on the read-only SIMPEG report tab");
assert.equal(canSelectFoundationAttendanceReportScope([{ app: "simpeg", role: "pimpinan" }]), true, "Foundation leadership must choose foundation-wide or individual active-unit reports");
assert.equal(canSelectFoundationAttendanceReportScope([{ app: "simpeg", role: "admin_unit", unitId: "unit-a" }]), false, "Unit admins must not receive foundation-wide report scope");
assert.equal(hasSimpegManagementAccess([]), false);

const page = readFileSync(resolve(import.meta.dirname, "../src/app/page.tsx"), "utf8");
const reportDashboard = readFileSync(resolve(import.meta.dirname, "../src/components/attendance/attendance-report-dashboard.tsx"), "utf8");
assert.match(page, /fetchEmployeeAttendanceData/, "pegawai must have an employee-only loading path");
assert.match(page, /simpegLandingTab/, "landing tab must derive from shared role classification");
const employeeLoader = page.match(/const fetchEmployeeAttendanceData[\s\S]*?\n  };\n\n  useEffect/);
assert.ok(employeeLoader, "pegawai must have an employee-only loading path");
assert.doesNotMatch(
  employeeLoader[0],
  /\/api\/attendance\/configs/,
  "employee load path must not fetch GPS management configurations",
);
assert.match(
  page,
  /else if \(reportViewer\) \{\s*await Promise\.all\(\[fetchAttendanceReport\(\), fetchAttendanceReportUnits\(\)\]\);/,
  "Foundation leadership must load only report-safe data and the canonical report-unit catalog",
);
assert.match(page, /canSelectFoundationAttendanceReportScope\(roles\)/, "Foundation leadership scope selection must remain separate from SIMPEG management access");
assert.match(page, /\/api\/attendance\/report-units/, "Report viewers must load selector choices from the dedicated report-unit API");
const bootstrap = page.match(/async function bootstrap\(\) \{[\s\S]*?\n    \}\n    void bootstrap\(\);/);
assert.ok(bootstrap, "SIMPEG page must retain a single bootstrap lifecycle");
assert.match(
  bootstrap[0],
  /finally \{\s*setLoading\(false\);\s*\}/,
  "Every SIMPEG bootstrap role path, including report-only Pimpinan, must settle the page loading state",
);
assert.match(reportDashboard, /canSelectFoundationScope/, "Report dashboard must use a report-specific scope capability");
assert.doesNotMatch(reportDashboard, /canManageAllUnits/, "Report dashboard must not require operational unit-management access for foundation scope selection");

console.log("SIMPEG employee attendance access contract passed");
