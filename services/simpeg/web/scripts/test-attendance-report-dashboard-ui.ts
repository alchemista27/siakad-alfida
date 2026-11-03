import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pagePath = resolve(root, "src/app/page.tsx");
const dashboardPath = resolve(root, "src/components/attendance/attendance-report-dashboard.tsx");

assert.ok(existsSync(dashboardPath), "attendance report dashboard component must exist");
const page = readFileSync(pagePath, "utf8");
const dashboard = readFileSync(dashboardPath, "utf8");

assert.match(page, /type SimpegTab =[\s\S]*?"reports"/, "SIMPEG must register a reports tab");
assert.match(page, /label: "Laporan Kehadiran"/, "manager sidebar must expose the attendance report dashboard");
assert.match(page, /activeTab === "reports"/, "page must render the reports tab");
assert.match(page, /\/api\/attendance\/dashboard/, "page must load the protected attendance report API");
assert.match(page, /simpegLandingTab\(roles\)/, "manager landing tab must come from role access policy");

assert.match(dashboard, /Hari ini hadir/, "dashboard must show today present count");
assert.match(dashboard, /Terlambat/, "dashboard must show today late count");
assert.match(dashboard, /Izin/, "dashboard must show today permission count");
assert.match(dashboard, /Cuti/, "dashboard must show today leave count");
assert.match(dashboard, /Top 10 Karyawan Tepat Waktu/, "dashboard must show a punctuality ranking");
assert.match(dashboard, /type="month"/, "dashboard must have a month selector");
assert.match(dashboard, /Keseluruhan Yayasan/, "super admin must be able to select whole-foundation scope");
assert.match(dashboard, /conic-gradient/, "monthly attendance composition must render as a pie chart");
assert.doesNotMatch(dashboard, /window\.(alert|confirm)|\bconsole\./, "report dashboard must not use native dialogs or console interactions");

console.log("SIMPEG attendance report dashboard UI contract passed");
