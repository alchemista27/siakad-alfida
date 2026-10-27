import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const topbar = readFileSync(resolve(root, "src/components/SpmbTopbar.tsx"), "utf8");

assert(topbar.includes("TopbarFoundationLogo"), "topbar must display the foundation logo");
assert(topbar.includes('serviceName = "SPMB"'), "topbar must identify the SPMB service");
assert(topbar.includes("/modules"), "topbar must link to the Auth module chooser");
assert(topbar.includes("/api/auth/logout"), "topbar must use central Auth logout");
assert(topbar.includes("getCurrentSsoUser"), "topbar must load the signed-in identity");
assert(topbar.includes("user?.fullName"), "topbar must render the signed-in name");
assert(topbar.includes("roleLabel"), "topbar must render the signed-in role");
assert(topbar.includes("initials"), "topbar must render an avatar fallback");

for (const page of [
  "src/app/parent/page.tsx",
  "src/app/parent/form-student/page.tsx",
  "src/app/parent/form-parents/page.tsx",
  "src/app/parent/documents/page.tsx",
  "src/app/parent/medical/page.tsx",
  "src/app/parent/observation/page.tsx",
  "src/app/parent/payment/page.tsx",
  "src/app/parent/result/page.tsx",
  "src/app/parent/select-unit/page.tsx",
  "src/app/parent/biodata/page.tsx",
  "src/app/claim/[token]/page.tsx",
]) {
  const source = readFileSync(resolve(root, page), "utf8");
  assert(source.includes("SpmbTopbar"), `topbar missing from ${page}`);
  assert(!source.includes("SpmbNavbar"), `legacy navbar remains in ${page}`);
}

const adminPage = readFileSync(resolve(root, "src/app/admin/page.tsx"), "utf8");
const observerPage = readFileSync(resolve(root, "src/app/observer/page.tsx"), "utf8");
assert(!adminPage.includes("showUserIdentity={false}"), "admin topbar must retain identity controls");
assert(!observerPage.includes("showUserIdentity={false}"), "observer topbar must retain identity controls");
assert(!observerPage.includes("Portal Admin"), "observer topbar must only offer the Auth module chooser");

console.log("SPMB topbar contract passed");
