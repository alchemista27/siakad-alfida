import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const source = await readFile(resolve(process.cwd(), "src/app/modules/page.tsx"), "utf8");

  assert.match(source, /canSeeCoreServiceModule/, "core services must use the shared assignment helper");
  assert.match(
    source,
    /const visibleCoreServiceModules = coreServiceModules\.filter\([\s\S]*?canSeeCoreServiceModule\(roles, module\.id\)/,
    "one shared assignment filter must derive visible core services",
  );
  assert.match(
    source,
    /visibleCoreServiceModules\.map\([\s\S]*?navLabel[\s\S]*?href: module\.url/,
    "the sidebar must be derived from the visible core service list",
  );
  assert.match(
    source,
    /\.\.\.visibleCoreServiceModules,/
    , "cards must be derived from the same visible core service list as the sidebar");
  assert.match(source, /getSpmbEntries\(roles\)/, "SPMB entries must be resolved from actual SSO roles");
  assert.match(source, /\.\.\.spmbModuleCards,/, "SPMB cards must come only from role-specific SPMB entries");
  assert.doesNotMatch(source, /isParentOnlyPortalUser|isParentOnly\s*\?/, "the catalog must not use a parent-only branch");
  assert.doesNotMatch(source, /id:\s*"sisarpras"|id:\s*"sisurat"/, "unassigned inactive placeholders must not appear in the catalog");
  assert.match(
    source,
    /const isGlobalSuperAdmin = roles\.some\([\s\S]*?r\.role === "super_admin"[\s\S]*?r\.app === "\*"[\s\S]*?r\.app === "auth"[\s\S]*?r\.app === "core"/,
    "Admin Yayasan must be restricted to a global Super Admin scope",
  );
  assert.match(source, /userName=\{user\?\.fullName/, "the signed-in full name must remain in the AppShell");
  assert.match(source, /userRole=\{primaryRole\}/, "the signed-in primary role must remain in the AppShell");
  assert.match(source, /avatarUrl=\{user\?\.avatarUrl\}/, "the signed-in avatar must remain in the AppShell");

  console.log("Auth module catalog contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
