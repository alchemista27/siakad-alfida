import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const webRoot = resolve(import.meta.dirname, "..");
const panelPath = resolve(webRoot, "src/components/attendance/workday-management-panel.tsx");
assert.ok(existsSync(panelPath), "workday management panel must exist");

const panel = readFileSync(panelPath, "utf8");
const page = readFileSync(resolve(webRoot, "src/app/page.tsx"), "utf8");

assert.match(panel, /Kalender Hari Libur/, "panel must provide holiday calendar management");
assert.match(panel, /Daftar Piket Sabtu/, "panel must provide Saturday duty roster management");
assert.match(panel, /fetch\("\/api\/attendance\/holidays"/, "panel must create and update holidays through the API");
assert.match(panel, /fetch\("\/api\/attendance\/saturday-duties"/, "panel must create and update Saturday duties through the API");
assert.match(panel, /role="dialog"/, "destructive actions must use a designed confirmation dialog");
assert.doesNotMatch(panel, /window\.(alert|confirm)|\bconsole\./, "panel must not use native dialogs or console interactions");
assert.match(page, /WorkdayManagementPanel/, "dashboard must integrate the workday panel");
assert.match(page, /workday\.required/, "dashboard must render actual workday status from attendance context");

console.log("SIMPEG workday management UI contract passed");
