import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

assert(existsSync(resolve(root, "src/TopbarFoundationLogo.tsx")), "missing shared topbar logo component");
const logo = read("src/TopbarFoundationLogo.tsx");
assert.match(logo, /export function TopbarFoundationLogo/);
assert.match(logo, /DEFAULT_FOUNDATION_LOGO_URL/);
assert.match(logo, /bg-tertiary/);
assert.match(logo, /text-on-tertiary/);
assert.match(logo, /object-contain/);
assert.match(logo, /rounded-(sm|md)/);
assert.doesNotMatch(logo, /rounded-lg/);

for (const file of ["src/AppShell.tsx", "src/Navbar.tsx"]) {
  const source = read(file);
  assert.match(source, /TopbarFoundationLogo/, `${file} must render the shared topbar logo`);
}

assert.match(read("src/index.ts"), /TopbarFoundationLogo/);
console.log("UI topbar logo surface contract passed");
