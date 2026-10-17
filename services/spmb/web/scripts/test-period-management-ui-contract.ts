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

console.log("SPMB period management UI contract passed");
