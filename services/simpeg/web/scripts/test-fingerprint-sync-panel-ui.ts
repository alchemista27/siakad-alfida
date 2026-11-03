import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const component = readFileSync(resolve(import.meta.dirname, "../src/components/attendance/fingerprint-sync-panel.tsx"), "utf8");
const page = readFileSync(resolve(import.meta.dirname, "../src/app/page.tsx"), "utf8");
assert.match(component, /Sinkronisasi hanya membaca log dari alat\..*presensi GPS\/manual yang sudah ada tidak ditimpa\./, "UI must explain no-overwrite read-only policy");
assert.match(component, /akun Auth aktif dan peran staf/, "UI must explain Auth-first attendance eligibility");
assert.match(component, /\/api\/attendance\/fingerprint\/sync/, "manual sync must use same-origin API");
assert.match(component, /\/api\/attendance\/fingerprint\/mappings\//, "UI must support explicit enrollment mappings");
assert.doesNotMatch(component, /window\.alert|window\.confirm|console\.log/, "UI must not use native dialog or console feedback");
assert.match(page, /FingerprintSyncPanel/, "management page must integrate fingerprint panel");
assert.match(page, /activeTab === "fingerprint"/, "fingerprint panel must be tab-gated");
console.log("SIMPEG fingerprint sync panel UI contract passed");
