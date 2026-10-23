import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const shell = readFileSync(resolve(root, "src/components/siyaum-app-shell.tsx"), "utf8");
const monitoring = readFileSync(resolve(root, "src/app/(dashboard)/monitoring/monitoring-client.tsx"), "utf8");

assert.doesNotMatch(shell, /import \{ AppShell \} from "@alfida\/ui"/, "SIYAUM must not inherit the generic service shell");
assert.match(shell, /Ritme pembinaan/, "SIYAUM shell needs its own mentoring identity");
assert.match(shell, /Jurnal halaqah/, "SIYAUM navigation needs its own learning-language");
assert.match(shell, /Cakupan peran/, "SIYAUM shell needs role context in the workspace");
assert.match(shell, /border-l-\[3px\]/, "SIYAUM active navigation needs a distinct, low-noise rail");
assert.match(monitoring, /Jurnal halaqah hari ini/, "SIYAUM monitoring needs service-specific copy");

console.log("SIYAUM service identity UI contract passed");
