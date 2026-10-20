import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

const admin = read("src/app/admin/page.tsx");
const observer = read("src/app/observer/page.tsx");
const navbar = read("src/components/SpmbNavbar.tsx");

for (const forbidden of [
  "/api/registrations/offline",
  "/api/imports/preview",
  "/api/imports/commit",
  "showOfflineModal",
  "showImportModal",
  "handleSaveOffline",
  "handlePreviewImport",
  "handleCommitImport",
  "Entri Offline",
  "Impor CSV",
]) {
  assert(!admin.includes(forbidden), `admin UI must not retain new-registration bypass: ${forbidden}`);
}
assert(!admin.includes("filterSource"), "admin UI must not retain obsolete registration source controls");
assert(admin.includes('title: "Sistem"'), "admin sidebar must contain the System group");
assert(admin.includes('label: "Portal Modul"'), "admin sidebar must link to the module portal");
assert(admin.includes("topbarActions="), "admin AppShell must expose topbar actions");
assert(admin.includes("Pilih Modul"), "admin topbar must offer module selection");

assert(observer.includes('import { AppShell } from "@alfida/ui";'), "observer page must use AppShell");
assert(observer.includes("sidebarGroups={sidebarGroups}"), "observer AppShell must receive sidebar navigation");
assert(observer.includes("topbarActions="), "observer AppShell must expose topbar actions");
assert(observer.includes("Portal Admin"), "observer navigation must expose the SPMB admin portal");
assert(observer.includes("Portal Modul"), "observer navigation must expose the central module portal");
assert(!observer.includes("<header"), "observer custom header must be replaced by AppShell");

assert(navbar.includes("/register?return_to="), "Daftar Sekarang must target the existing Auth parent-registration route");
assert(navbar.includes("encodeURIComponent(parentPortalUrl)"), "Daftar Sekarang must encode return_to for /parent");
assert(!navbar.includes('href="/register"'), "Daftar Sekarang must not use a local unauthenticated registration route");
assert(!existsSync(resolve(root, "src/app/register/page.tsx")), "local unauthenticated registration route must be removed");

console.log("SPMB parent-account registration UI contract passed");
