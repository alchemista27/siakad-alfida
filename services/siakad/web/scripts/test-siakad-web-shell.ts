import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/globals.css",
  "src/components/app-shell.tsx",
  "src/components/inline-notice.tsx",
  "src/lib/api.ts",
];

for (const file of requiredFiles) {
  assert.equal(existsSync(resolve(root, file)), true, `missing SIAKAD web shell file: ${file}`);
}

const layout = readFileSync(resolve(root, "src/app/layout.tsx"), "utf8");
const page = readFileSync(resolve(root, "src/app/page.tsx"), "utf8");
const shell = readFileSync(resolve(root, "src/components/app-shell.tsx"), "utf8");
const notice = readFileSync(resolve(root, "src/components/inline-notice.tsx"), "utf8");
const css = readFileSync(resolve(root, "src/app/globals.css"), "utf8");
const api = readFileSync(resolve(root, "src/lib/api.ts"), "utf8");

assert.match(layout, /SIAKAD/, "layout must declare SIAKAD metadata");
assert.match(page, /SiakadAuthGate/, "dashboard must preserve the SIAKAD auth gate");
assert.match(page, /AppShell/, "root must render the operational AppShell");
assert.doesNotMatch(page, /ServicePlaceholder/, "root may not retain the service placeholder");
assert.match(page, /href="\/admin\/unit-identity"/, "dashboard may link only to the delivered identity page");
assert.match(shell, /w-\[250px\]/, "shell must use a 250px sidebar");
assert.match(shell, /h-\[60px\]/, "shell must use a 60px topbar");
assert.match(shell, /sticky top-0/, "topbar must remain sticky");
assert.match(shell, /href:\s*"\/"\s+as const/, "shell must link to the delivered dashboard");
assert.match(shell, /href:\s*"\/admin\/unit-identity"\s+as const/, "shell must link to the delivered identity page");
assert.doesNotMatch(shell, /href:\s*"\/admin\/(?!unit-identity")/, "shell may not link to undelivered admin routes");
assert.match(notice, /role="status"/, "InlineNotice must expose status updates accessibly");
assert.doesNotMatch(notice, /alert\(|confirm\(/, "InlineNotice may not use blocking browser dialogs");
assert.match(css, /font-family:\s*['"]?Inter/, "body must use Inter");
assert.match(css, /font-family:\s*['"]?Lora/, "headings must use Lora");
assert.match(css, /#454545/, "shell must retain the primary color token");
assert.match(css, /#0f7f6d/, "shell must retain the tertiary color token");
assert.match(css, /#E3E8E7/, "shell must retain the border color token");
assert.match(css, /#F7F8F8/, "shell must retain the neutral color token");
assert.match(api, /content-type/i, "API helper must inspect response content types");
assert.match(api, /res\.text\(\)/, "API helper must safely parse non-JSON responses");
assert.match(api, /options\.body instanceof FormData/, "API helper must avoid JSON headers for form data");
assert.match(api, /error/, "API helper must surface response errors");

console.log("SIAKAD operational shell contract passed");
