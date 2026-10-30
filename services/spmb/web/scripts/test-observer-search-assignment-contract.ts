import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

const panel = read("src/components/admin/observer-assignment-panel.tsx");
const adminPage = read("src/app/admin/page.tsx");

assert(!panel.includes("User ID Penguji"), "observer assignment must not require a manually entered user ID");
assert(!panel.includes("Nama Penguji"), "observer assignment must not require a manually entered name");
assert(panel.includes("Cari karyawan atau guru unit"), "observer assignment must expose the unit employee search");
assert(!panel.includes("peran Observer SPMB"), "employees must become observers by assignment, not by a pre-existing role");
assert(panel.includes("/api/observers/candidates?unitId="), "candidate search must use the scoped SPMB API");
assert(panel.includes("userId: selectedCandidate.id"), "assignment must submit the selected candidate ID");
assert(panel.includes("unitId,"), "assignment must submit the selected period unit");
assert(adminPage.includes("unitId={periods.find((period) => period.id === selectedPeriodId)?.unitId}"), "admin page must pass the selected period unit to assignment");
assert(!existsSync(resolve(root, "src/app/api/observers/candidates/route.ts")), "candidate search must not proxy through Auth or depend on a pre-existing observer role");

console.log("SPMB observer search assignment contract passed");
