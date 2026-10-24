import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const serviceRoot = resolve(import.meta.dirname, "../..");
const dockerfile = readFileSync(resolve(serviceRoot, "Dockerfile"), "utf8");
const start = readFileSync(resolve(serviceRoot, "start.sh"), "utf8");

assert.match(dockerfile, /apk add --no-cache libc6-compat\s+openssl/, "SIYAUM image must include OpenSSL for Prisma migrations");
assert.match(dockerfile, /EXPOSE 3000/, "SIYAUM must expose only its public Next.js port");
assert.match(start, /prisma migrate deploy/, "SIYAUM startup must apply versioned migrations");
assert.match(start, /HOSTNAME=0\.0\.0\.0 PORT=3000/, "SIYAUM Next.js must bind to all interfaces");
const baseline = resolve(serviceRoot, "api/prisma/migrations/20261020000000_baseline_legacy_ymq/migration.sql");
assert.equal(existsSync(baseline), true, "SIYAUM must record the legacy database baseline before incremental migrations");

console.log("SIYAUM deployment lifecycle contract passed");
