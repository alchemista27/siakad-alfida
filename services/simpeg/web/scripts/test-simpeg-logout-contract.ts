import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const page = readFileSync(resolve(root, "src/app/page.tsx"), "utf8");

assert.match(page, /const handleLogout = async \(\) =>/, "SIMPEG must own an explicit async logout handler");
assert.match(
  page,
  /fetch\("https:\/\/auth\.alfida\.or\.id\/api\/auth\/logout",\s*\{[\s\S]*?method:\s*"POST",\s*credentials:\s*"include",?\s*\}\)/,
  "SIMPEG logout must invalidate the central Auth session with cross-subdomain credentials",
);
assert.match(page, /if \(!response\.ok\) \{\s*throw new Error/, "SIMPEG must not redirect as logged out when Auth rejects logout");
assert.match(page, /window\.location\.replace\("https:\/\/auth\.alfida\.or\.id\/login"\)/, "Successful logout must redirect to Auth login");
assert.match(page, /onLogout=\{handleLogout\}/, "AppShell logout must use the authenticated logout handler");
assert.doesNotMatch(
  page,
  /onLogout=\{\(\) => \{\s*window\.location\.href = "https:\/\/auth\.alfida\.or\.id\/login";/,
  "AppShell must not redirect to login without invalidating the session",
);

console.log("SIMPEG central logout contract passed");
