import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const page = readFileSync(resolve(root, "src/app/page.tsx"), "utf8");
const shell = readFileSync(resolve(root, "src/components/app-shell.tsx"), "utf8");

assert.match(page, /Ruang kendali akademik/, "SIAKAD dashboard needs an academic-control-room identity");
assert.match(page, /Jejak data akademik/, "SIAKAD dashboard needs a data-flow orientation card");
assert.match(page, /Langkah awal unit/, "SIAKAD dashboard needs a concrete next-step panel");
assert.match(shell, /SIAKAD\s*·\s*AKADEMIK/, "SIAKAD shell needs its own academic wordmark");
assert.match(shell, /Basis dokumen & pembelajaran/, "SIAKAD shell needs a service-specific descriptor");
assert.match(shell, /border-l-\[3px\]/, "SIAKAD active navigation needs a restrained academic rail");

console.log("SIAKAD service identity UI contract passed");
