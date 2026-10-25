import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const root = resolve(import.meta.dirname, "..");
  const source = (relativePath: string) => readFile(resolve(root, relativePath), "utf8");
  const [page, selector, middleware, navbar] = await Promise.all([
    source("src/app/page.tsx"),
    source("src/components/spmb-entry-selector.tsx"),
    source("src/middleware.ts"),
    source("src/components/SpmbNavbar.tsx"),
  ]);

  assert.match(page, /SpmbEntrySelector/, "SPMB root must render a role-aware entry selector");
  assert.doesNotMatch(page, /redirect\(\s*["']\/admin["']\s*\)/, "SPMB root must not send every account to admin");
  assert.match(selector, /getSpmbEntries/, "root selector must use the shared role resolver");
  assert.match(selector, /getCurrentSsoUser/, "root selector must inspect authenticated SSO claims through its same-origin proxy client");
  assert.doesNotMatch(selector, /\$\{authUrl\}\/api\/auth\/me/, "root selector must not call Auth cross-origin from the browser");
  assert.match(selector, /router\.replace\(entries\[0\]\.path\)/, "one allowed workspace must redirect directly");
  assert.match(selector, /no-spmb-role/, "users without an SPMB role must receive an explicit safe state");
  assert.match(middleware, /getServiceRootUrl\(request\)/, "legacy SPMB login must return to the role-aware root");
  assert.doesNotMatch(middleware, /spmb\.alfida\.or\.id"?\}\/admin|\/admin`/, "middleware must not hard-code admin as a root return target");
  assert.doesNotMatch(navbar, /Portal Panitia \/ Admin/, "parent navigation must not advertise an unauthorized admin route");

  console.log("SPMB entry routing contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
