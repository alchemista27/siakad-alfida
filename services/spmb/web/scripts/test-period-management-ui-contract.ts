import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const panel = readFileSync(resolve(root, "src/components/admin/period-management-panel.tsx"), "utf8");
const modalPath = resolve(root, "src/components/admin/period-edit-modal.tsx");

assert(existsSync(modalPath), "period edit modal is required");
const modal = readFileSync(modalPath, "utf8");
assert.match(panel, /<article[^>]+data-period-card=/, "each registration period must render as a self-contained card");
assert.match(panel, /Buka edit gelombang/, "every period card must offer editing");
assert.match(panel, /Tutup gelombang|Buka gelombang/, "every period card must offer its open or close action");
assert.match(panel, /Hapus Periode/, "every period card must offer deletion");
assert.doesNotMatch(panel, /\{!period\.isOpen && \(/, "delete action must not be hidden for open periods");
assert.match(panel, /deleteCandidate/, "deletion must require in-app confirmation state");
const cardLoop = panel.indexOf("periods.map((period) => (");
const firstAction = panel.indexOf("Buka edit gelombang");
assert(cardLoop >= 0 && firstAction > cardLoop, "period actions must be rendered inside the mapped period card");
assert.match(modal, /method:\s*["']PUT["']/, "edit modal must update through PUT");
assert.match(modal, /\/api\/periods\/\$\{encodeURIComponent\(period\.id\)\}/, "edit modal must target the period id");
assert.doesNotMatch(`${panel}\n${modal}`, /\b(alert|confirm)\(/, "period actions must use custom UI, not native dialogs");

console.log("SPMB period management UI contract passed");
