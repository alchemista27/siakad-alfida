import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = resolve(import.meta.dirname, "..");
const required = [
  "src/components/admin/registration-review-panel.tsx",
  "src/components/admin/decision-panel.tsx",
  "src/components/admin/admin-notice.tsx",
  "src/app/admin/page.tsx",
];

for (const file of required) {
  assert(existsSync(resolve(root, file)), `missing payment/review UI file: ${file}`);
  const content = readFileSync(resolve(root, file), "utf8");
  assert(!content.includes("alert(") && !content.includes("confirm("), `file ${file} must not use native browser dialogs`);
}

const reviewPanel = readFileSync(resolve(root, "src/components/admin/registration-review-panel.tsx"), "utf8");
assert(reviewPanel.includes("verify-payment"), "review panel must support payment verification");
assert(reviewPanel.includes("verify-documents"), "review panel must support dossier verification");

console.log("SPMB payment review UI contract passed");
