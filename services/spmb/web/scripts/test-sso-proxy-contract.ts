import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

for (const file of ["src/app/api/sso/me/route.ts", "src/lib/sso-client.ts"]) {
  assert(existsSync(resolve(root, file)), `missing ${file}`);
}

const route = read("src/app/api/sso/me/route.ts");
assert.match(route, /request\.headers\.get\(["']cookie["']\)/);
assert.match(route, /Cache-Control["']?\s*:\s*["']no-store/);
assert.match(route, /NextResponse\.json/);

const client = read("src/lib/sso-client.ts");
assert.match(client, /fetch\(["']\/api\/sso\/me["']/);
assert.match(client, /SsoClientError/);

for (const file of [
  "src/components/spmb-entry-selector.tsx",
  "src/components/SpmbNavbar.tsx",
  "src/app/admin/page.tsx",
  "src/app/observer/page.tsx",
]) {
  const source = read(file);
  assert.match(source, /getCurrentSsoUser/, `${file} must use same-origin SSO client`);
  assert.doesNotMatch(source, /\$\{authUrl\}\/api\/auth\/me/, `${file} must not request Auth cross-origin directly`);
}

console.log("SPMB SSO proxy contract passed");
