import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = resolve(import.meta.dirname, "..");
const required = [
  "src/components/admin/period-management-panel.tsx",
  "src/components/admin/observation-schedule-panel.tsx",
  "src/components/admin/admin-notice.tsx",
  "src/app/admin/page.tsx",
];

for (const file of required) {
  assert(existsSync(resolve(root, file)), `missing period management UI file: ${file}`);
  const content = readFileSync(resolve(root, file), "utf8");
  assert(!content.includes("alert(") && !content.includes("confirm("), `file ${file} must not use native browser dialogs`);
}

const periodPanel = readFileSync(resolve(root, "src/components/admin/period-management-panel.tsx"), "utf8");
assert(periodPanel.includes("/api/periods"), "period panel must interact with /api/periods");
assert(periodPanel.includes("/open") && periodPanel.includes("/close"), "period panel must support explicit open and close actions");
assert(periodPanel.includes('method: "DELETE"'), "period panel must call DELETE /api/periods/:id");
assert(periodPanel.includes("Hapus Periode"), "closed periods must expose a delete action");
assert(periodPanel.includes("deleteCandidate"), "deletion must require in-app confirmation state");
assert(periodPanel.includes("ID Tahun Ajaran SIAKAD (opsional)"), "mapping input must be labelled as optional SIAKAD mapping");
assert(periodPanel.includes("bukan label tahun ajaran SPMB"), "mapping help must distinguish local SPMB label from SIAKAD ID");

console.log("SPMB period management UI contract passed");
