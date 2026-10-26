import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = resolve(import.meta.dirname, "..");
const required = [
  "src/components/admin/observer-assignment-panel.tsx",
  "src/components/observer/observer-worklist.tsx",
  "src/components/observer/observer-score-modal.tsx",
  "src/app/observer/page.tsx",
];

for (const file of required) {
  assert(existsSync(resolve(root, file)), `missing observer UI file: ${file}`);
  const content = readFileSync(resolve(root, file), "utf8");
  assert(!content.includes("alert(") && !content.includes("confirm("), `file ${file} must not use native browser dialogs`);
  assert(!content.includes("/api/registrations"), `observer file ${file} must not call generic /api/registrations`);
  assert(!content.includes("observerId"), `observer file ${file} must not submit client-controlled observerId`);
}

const observerPage = readFileSync(resolve(root, "src/app/observer/page.tsx"), "utf8");
assert(observerPage.includes("/api/observers/me/worklist"), "observer page must load /api/observers/me/worklist");
assert(observerPage.includes("/api/observers/me/rankings"), "observer page must load /api/observers/me/rankings");
assert(observerPage.includes("/api/observers/me/results"), "observer page must submit to /api/observers/me/results");

const adminPage = readFileSync(resolve(root, "src/app/admin/page.tsx"), "utf8");
assert(/href:\s*["']\/admin\?tab=observations["']/.test(adminPage), "admin observer navigation must target assignment settings");
assert(/setAdminTab\(["']observations["']\)/.test(adminPage), "admin page must honor the observations tab route state");
assert(/hasObserverRole/.test(observerPage), "observer portal must classify actual observer role separately");
assert(/\/admin\?tab=observations/.test(observerPage), "admin unit entering observer portal must be redirected to assignment settings");
assert(/window\.location\.(replace|assign)/.test(observerPage), "role redirect must occur before worklist loading");

console.log("SPMB observer UI contract passed");
