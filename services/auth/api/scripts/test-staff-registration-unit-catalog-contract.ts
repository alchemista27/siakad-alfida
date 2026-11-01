import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const service = readFileSync(resolve(import.meta.dirname, "../src/auth/auth.service.ts"), "utf8");
const moduleSource = readFileSync(resolve(import.meta.dirname, "../src/auth/auth.module.ts"), "utf8");

assert.doesNotMatch(service, /ALFIDA_UNITS/, "staff registration must not keep a stale hardcoded unit catalog");
assert.match(service, /simpegUnits\.listActive\(\)/, "public unit options must come from SIMPEG's active catalog");
assert.match(service, /const units = await this\.getUnits\(\)/, "staff validation must use the same live catalog as the public endpoint");
assert.match(moduleSource, /SimpegUnitCatalogClient/, "AuthModule must register the SIMPEG catalog client");
assert.match(moduleSource, /SIMPEG_UNIT_CATALOG_FETCH/, "AuthModule must inject the runtime fetch implementation");

console.log("Auth staff registration unit catalog contract passed");
