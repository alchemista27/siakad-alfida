import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const page = readFileSync(resolve(root, "src/app/page.tsx"), "utf8");
const dashboard = readFileSync(resolve(root, "src/components/attendance/attendance-report-dashboard.tsx"), "utf8");
const sources = readFileSync(resolve(root, "src/components/attendance/attendance-data-source-panel.tsx"), "utf8");

assert.match(dashboard, /Download PDF/, "report dashboard must expose PDF download");
assert.match(dashboard, /onDownload/, "PDF download must be supplied by the page controller");
assert.match(page, /\/api\/attendance\/report\.pdf/, "page must request the protected PDF endpoint");
assert.match(page, /response\.headers\.get\("content-type"\).*application\/pdf/, "page must verify PDF response content type");
assert.match(page, /URL\.revokeObjectURL/, "page must revoke the temporary download URL");
assert.doesNotMatch(dashboard, /GPS — riwayat, belum tersedia|GPS — belum tersedia/, "dashboard GPS copy must be runtime-aware");
assert.doesNotMatch(sources, /GPS — belum tersedia/, "source panel GPS copy must be runtime-aware");
assert.match(page, /gpsEnabled && activeTab === "attendance"/, "employee GPS controls must only render when the server runtime enables GPS");
assert.doesNotMatch(page, /false && activeTab === "attendance"/, "employee GPS controls must not remain permanently disabled");
assert.doesNotMatch(page, /window\.(alert|confirm)|\bconsole\./, "attendance download UI must use bounded feedback");

console.log("SIMPEG attendance PDF and GPS UI contract passed");
