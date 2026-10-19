import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

async function source(relativePath: string) {
  return readFile(resolve(root, relativePath), "utf8");
}

async function main() {
  const [controller, schema, migration, dockerfile, start] = await Promise.all([
    source("src/internal/internal-spp.controller.ts"),
    source("prisma/schema.prisma"),
    source("prisma/migrations/20261019000000_initial_siskeu_invoices/migration.sql"),
    source("../Dockerfile"),
    source("../start.sh"),
  ]);
  assert.match(controller, /@Get\("spp\/invoices"\)/);
  assert.match(controller, /@Post\("spp\/invoices\/:id\/payment-session"\)/);
  assert.doesNotMatch(controller, /@Post\("spp\/invoices"\)/, "internal endpoints must never create invoices");
  assert.match(schema, /@@unique\(\[enrollmentId, billingPeriod\]\)/);
  assert.match(schema, /@@schema\("siskeu"\)/);
  assert.match(migration, /CREATE SCHEMA IF NOT EXISTS "siskeu"/);
  assert.match(migration, /CHECK \("amount" > 0\)/);
  assert.match(dockerfile, /pnpm install --frozen-lockfile --ignore-scripts/);
  assert.match(dockerfile, /openssl/);
  const migrationIndex = start.indexOf("pnpm --filter siskeu-api exec prisma migrate deploy --schema services\/siskeu\/api\/prisma\/schema.prisma");
  const nodeIndex = start.indexOf("node services\/siskeu\/api\/dist\/main.js");
  assert.ok(migrationIndex >= 0 && nodeIndex > migrationIndex, "migration must run before the API process");
  console.log("SISKEU static lifecycle contract passed");
}

void main();
