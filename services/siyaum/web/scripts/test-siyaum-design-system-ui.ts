import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const webRoot = resolve(import.meta.dirname, "..");
const repoRoot = resolve(webRoot, "../../..");
const readWeb = (relativePath: string) => readFileSync(resolve(webRoot, relativePath), "utf8");
const tilawah = readWeb("src/app/(dashboard)/tilawah/tilawah-client.tsx");
const shell = readWeb("src/components/siyaum-app-shell.tsx");
const monitoring = readWeb("src/app/(dashboard)/monitoring/monitoring-client.tsx");
const design = readFileSync(resolve(repoRoot, "DESIGN.md"), "utf8");

assert.match(design, /fontFamily:\s*Lora/, "DESIGN.md must declare the implemented heading font Lora");
assert.match(tilawah, /SiyaumAppShell/, "Tilawah must use the service-specific shell");
assert.match(tilawah, /font-heading/, "Tilawah headings must use the heading token");
assert.match(tilawah, /bg-neutral/, "Tilawah must use the neutral page surface token");
assert.match(tilawah, /border-border/, "Tilawah must use the border token");
assert.match(tilawah, /text-tertiary/, "Tilawah emphasis must use the tertiary token");
assert.doesNotMatch(tilawah, /\b(?:slate|blue|amber|emerald)-/, "Tilawah must not use the legacy color palette");
assert.doesNotMatch(tilawah, /shadow-(?!none)/, "Tilawah must use tonal layering and borders instead of decorative shadows");
assert.doesNotMatch([shell, monitoring].join("\n"), /#[0-9a-fA-F]{3,8}\b/, "SIYAUM components must consume semantic classes rather than literal hex values");

console.log("SIYAUM design-system UI contract passed");
