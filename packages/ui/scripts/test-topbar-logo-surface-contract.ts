import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

assert(existsSync(resolve(root, "src/TopbarFoundationLogo.tsx")), "missing shared topbar logo component");
const logo = read("src/TopbarFoundationLogo.tsx");
assert.match(logo, /export function TopbarFoundationLogo/);
assert.match(logo, /DEFAULT_FOUNDATION_LOGO_URL/);
assert.match(logo, /bg-white/);
assert.match(logo, /border-border/);
assert.match(logo, /text-tertiary/);
assert.doesNotMatch(logo, /bg-tertiary/);
assert.doesNotMatch(logo, /text-on-tertiary/);
assert.match(logo, /object-contain/);
assert.match(logo, /rounded-(sm|md)/);
assert.doesNotMatch(logo, /rounded-lg/);

for (const file of ["src/AppShell.tsx", "src/Navbar.tsx"]) {
  const source = read(file);
  assert.match(source, /TopbarFoundationLogo/, `${file} must render the shared topbar logo`);
}

const appShell = read("src/AppShell.tsx");
assert.match(appShell, /avatarUrl\?: string \| null/, "AppShell must accept a persisted profile-avatar URL");
assert.match(appShell, /profileHref\?: string/, "AppShell must expose an optional profile destination");
assert.match(appShell, /onError=\{\(\) => setAvatarFailed\(true\)\}/, "failed avatar images must fall back safely");
assert.match(appShell, /<img[\s\S]*src=\{avatarUrl!?\}/, "AppShell must render the supplied avatar image");
assert.match(appShell, /userName/, "AppShell must continue displaying the signed-in name");
assert.match(appShell, /userRole/, "AppShell must continue displaying the signed-in role");

assert.match(read("src/index.ts"), /TopbarFoundationLogo/);
console.log("UI topbar logo surface contract passed");
