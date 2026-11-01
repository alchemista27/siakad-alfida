import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../src/components/register-staff-form.tsx"), "utf8");

assert.doesNotMatch(source, /FALLBACK_UNITS/, "the staff form must not retain a stale hardcoded unit fallback");
assert.match(source, /useState<UnitOption\[\]>\(\[\]\)/, "unit options must begin empty until the live catalog resolves");
assert.match(source, /useState\(""\)/, "the form must not preselect a stale hardcoded unit id");
assert.match(source, /cache:\s*["']no-store["']/, "the live unit catalog request must not use cached data");
assert.match(source, /Daftar unit kerja belum tersedia/, "catalog failures must be visible to the registrant");
assert.match(source, /disabled=\{loading \|\| unitsLoading \|\| !unitId\}/, "submission must stay blocked until a live unit is selected");
assert.match(source, /disabled=\{loading \|\| unitsLoading\}/, "unit picker must remain disabled while its catalog is loading");

console.log("Auth staff form live unit-catalog contract passed");
