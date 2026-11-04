import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const componentPath = resolve(import.meta.dirname, "../src/components/attendance/attendance-data-source-panel.tsx");
assert.equal(existsSync(componentPath), true, "fingerprint operations must move into an attendance data-source panel");
const component = readFileSync(componentPath, "utf8");
const dashboard = readFileSync(resolve(import.meta.dirname, "../src/components/attendance/attendance-report-dashboard.tsx"), "utf8");
const page = readFileSync(resolve(import.meta.dirname, "../src/app/page.tsx"), "utf8");

assert.match(component, /Status Sumber Data/, "operational controls must be framed as a subsection of attendance sources");
assert.match(component, /GPS — belum tersedia/, "panel must state that GPS is not an active attendance source");
assert.match(component, /\/api\/attendance\/fingerprint\/sync/, "HR panel must retain same-origin manual sync");
assert.match(component, /\/api\/attendance\/fingerprint\/mappings\//, "authorized mapping workflow must remain available");
assert.doesNotMatch(component, /window\.alert|window\.confirm|console\.log/, "source panel must use app-native feedback");

assert.match(dashboard, /selectedSource/, "attendance dashboard must receive source filtering state");
assert.match(dashboard, /Sumber data/, "attendance dashboard must expose source filtering");
assert.match(dashboard, /GPS — belum tersedia/, "dashboard must not imply GPS attendance is active");
assert.match(dashboard, /Backfill administratif/, "dashboard must transparently identify administrative backfill");

assert.match(page, /AttendanceDataSourcePanel/, "report page must integrate the source panel");
assert.match(page, /activeTab === "reports"[\s\S]*?<AttendanceDataSourcePanel/, "source panel must render inside the reports view");
assert.match(page, /window\.location\.hash === "#fingerprint"/, "legacy fingerprint hash must redirect to reports");
assert.doesNotMatch(page, /activeTab === "fingerprint"/, "standalone fingerprint tab must be removed");
assert.doesNotMatch(page, /label: "Sinkronisasi Fingerprint"/, "fingerprint must not have its own sidebar entry");
assert.doesNotMatch(page, /label: "Presensi GPS"/, "GPS must not be presented as an active navigation feature");
console.log("SIMPEG unified attendance sources UI contract passed");
