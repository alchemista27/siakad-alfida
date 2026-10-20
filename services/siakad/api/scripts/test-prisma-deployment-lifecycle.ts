import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { fileURLToPath } from "node:url";

async function main() {
  const repoRoot = resolve(fileURLToPath(new URL("../../../../", import.meta.url)));
  const startScript = await readFile(resolve(repoRoot, "services/siakad/start.sh"), "utf8");
  const dockerfile = await readFile(resolve(repoRoot, "services/siakad/Dockerfile"), "utf8");

  const migrationCommand = "./services/siakad/api/node_modules/.bin/prisma migrate deploy --schema services/siakad/api/prisma/schema.prisma";
  const migrateIndex = startScript.indexOf(migrationCommand);
  const apiIndex = startScript.indexOf("node services/siakad/api/dist/main.js");
  assert(migrateIndex >= 0, "SIAKAD start.sh must run the service-local Prisma migration before serving traffic");
  assert(apiIndex >= 0 && migrateIndex < apiIndex, "prisma migrate deploy must run before the API process starts");
  assert(!/pnpm\s+--filter\s+siakad-api\s+exec\s+prisma\s+migrate\s+deploy/.test(startScript), "startup must not invoke Prisma through pnpm against the root node_modules");
  assert(!/^\s*(?:pnpm|npx).*prisma db push/m.test(startScript), "production startup must not use prisma db push");
  assert(startScript.includes("services/siakad/api/src/generated"), "startup must preserve the generated Prisma fallback");
  assert(dockerfile.includes("pnpm --filter siakad-api exec prisma generate"), "Docker build must generate the SIAKAD Prisma client");
  assert(dockerfile.includes("apk add --no-cache libc6-compat openssl"), "Alpine image must include OpenSSL for Prisma");
  assert(dockerfile.includes("COPY --from=builder --chown=appuser:nodejs /app ./"), "runner files must be readable by appuser");

  console.log("SIAKAD Prisma deployment lifecycle contract passed");
}

void main();
