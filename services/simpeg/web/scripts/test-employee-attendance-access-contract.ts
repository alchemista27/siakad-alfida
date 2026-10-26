import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  hasSimpegManagementAccess,
  isPegawaiRole,
  simpegLandingTab,
} from "../src/lib/simpeg-access";

assert.equal(hasSimpegManagementAccess([{ app: "simpeg", role: "pegawai" }]), false);
assert.equal(isPegawaiRole([{ app: "simpeg", role: "pegawai" }]), true);
assert.equal(simpegLandingTab([{ app: "simpeg", role: "pegawai" }]), "attendance");
assert.equal(hasSimpegManagementAccess([{ app: "simpeg", role: "admin_unit", unitId: "unit-a" }]), true);
assert.equal(simpegLandingTab([{ app: "simpeg", role: "admin_unit", unitId: "unit-a" }]), "assignments");
assert.equal(simpegLandingTab([{ app: "simpeg", role: "pegawai" }, { app: "simpeg", role: "admin_kepegawaian" }]), "assignments");
assert.equal(hasSimpegManagementAccess([]), false);

const page = readFileSync(resolve(import.meta.dirname, "../src/app/page.tsx"), "utf8");
assert.match(page, /fetchEmployeeAttendanceData/, "pegawai must have an employee-only loading path");
assert.match(page, /simpegLandingTab/, "landing tab must derive from shared role classification");
const employeeLoader = page.match(/const fetchEmployeeAttendanceData[\s\S]*?\n  };\n\n  useEffect/);
assert.ok(employeeLoader, "pegawai must have an employee-only loading path");
assert.doesNotMatch(
  employeeLoader[0],
  /\/api\/attendance\/configs/,
  "employee load path must not fetch GPS management configurations",
);

console.log("SIMPEG employee attendance access contract passed");
