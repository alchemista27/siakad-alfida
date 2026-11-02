import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(__dirname, "audit-unit-admin-coverage.ts"), "utf8");

assert.match(source, /AUTH_DATABASE_URL/);
assert.match(source, /SIMPEG_DATABASE_URL/);
assert.match(source, /findMany\(/);
assert.match(source, /user:\s*\{\s*isActive:\s*true\s*\}/);
assert.doesNotMatch(source, /\.(create|update|upsert|delete|executeRaw|\$executeRaw)\s*\(/);
assert.match(source, /\$disconnect\(\)/);
console.log("Unit admin audit CLI contract passed");
