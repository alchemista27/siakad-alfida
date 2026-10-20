import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

async function source(relativePath: string) {
  return readFile(resolve(root, relativePath), "utf8");
}

async function main() {
  const [internalController, schema, migration, dockerfile, start, healthController, appModule, main] = await Promise.all([
    source("src/internal/internal-spp.controller.ts"),
    source("prisma/schema.prisma"),
    source("prisma/migrations/20261019000000_initial_siskeu_invoices/migration.sql"),
    source("../Dockerfile"),
    source("../start.sh"),
    source("src/health.controller.ts").catch((error: NodeJS.ErrnoException) => error.code === "ENOENT" ? "" : Promise.reject(error)),
    source("src/app.module.ts"),
    source("src/main.ts"),
  ]);
  assert.match(internalController, /@Get\("spp\/invoices"\)/);
  assert.match(internalController, /@Post\("spp\/invoices\/:id\/payment-session"\)/);
  assert.doesNotMatch(internalController, /@Post\("spp\/invoices"\)/, "internal endpoints must never create invoices");
  assert.match(schema, /@@unique\(\[enrollmentId, billingPeriod\]\)/);
  assert.match(schema, /@@schema\("siskeu"\)/);
  assert.match(migration, /CREATE SCHEMA IF NOT EXISTS "siskeu"/);
  assert.match(migration, /CHECK \("amount" > 0\)/);
  assert.match(dockerfile, /pnpm install --frozen-lockfile --ignore-scripts/);
  assert.match(dockerfile, /openssl/);
  assert.match(dockerfile, /COPY --from=builder --chown=appuser:nodejs \/app \.\//, "runner files must be readable by appuser");

  const migrationCommand = "./services/siskeu/api/node_modules/.bin/prisma migrate deploy --schema services/siskeu/api/prisma/schema.prisma";
  const migrationIndex = start.indexOf(migrationCommand);
  const nodeIndex = start.indexOf("node services/siskeu/api/dist/main.js");
  assert.ok(migrationIndex >= 0 && nodeIndex > migrationIndex, "the service-local Prisma migration must run before the API process");
  assert.doesNotMatch(start, /pnpm\s+--filter\s+siskeu-api\s+exec\s+prisma\s+migrate\s+deploy/, "startup must not invoke Prisma through pnpm against the root node_modules");
  assert.match(start, /services\/siskeu\/api\/src\/generated/, "startup must retain the generated Prisma fallback");

  assert.match(main, /app\.setGlobalPrefix\("api"\)/, "health must be served under /api");
  assert.match(healthController, /@Controller\("health"\)/, "health controller must expose /health");
  assert.match(healthController, /@Get\(\)/, "health endpoint must accept GET requests");
  assert.match(healthController, /return\s+\{\s*status:\s*["']ok["']\s*,\s*service:\s*["']siskeu["']\s*\}/s, "health response must be the public status payload only");
  assert.doesNotMatch(healthController, /@UseGuards|process\.env|secret|token|password/i, "health endpoint must remain public and secret-free");
  assert.match(appModule, /import\s+\{\s*HealthController\s*\}\s+from\s+["']\.\/health\.controller["'];/, "app module must register the health controller");
  assert.match(appModule, /controllers:\s*\[\s*HealthController\s*\]/, "health controller must be registered without an auth guard");

  console.log("SISKEU static lifecycle and health contract passed");
}

void main();
