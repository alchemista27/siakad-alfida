import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

const panel = read("src/components/admin/observer-assignment-panel.tsx");
const adminPage = read("src/app/admin/page.tsx");
const route = read("src/app/api/observers/candidates/route.ts");

assert(!panel.includes("User ID Penguji"), "observer assignment must not require a manually entered user ID");
assert(!panel.includes("Nama Penguji"), "observer assignment must not require a manually entered name");
assert(panel.includes("Cari observer aktif"), "observer assignment must expose candidate search");
assert(panel.includes("/api/observers/candidates?unitId="), "candidate search must use the protected local proxy");
assert(panel.includes("userId: selectedCandidate.id"), "assignment must submit the selected candidate ID");
assert(panel.includes("unitId,"), "assignment must submit the selected period unit");
assert(adminPage.includes("unitId={periods.find((period) => period.id === selectedPeriodId)?.unitId}"), "admin page must pass the selected period unit to assignment");
assert(route.includes("/api/admin/users/observer-candidates"), "proxy must call the Auth observer candidate endpoint");
assert(route.includes("cookie: request.headers.get(\"cookie\") || \"\""), "proxy must forward the authenticated session cookie");

console.log("SPMB observer search assignment contract passed");
