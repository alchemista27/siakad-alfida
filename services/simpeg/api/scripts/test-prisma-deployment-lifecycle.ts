import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

async function main() {
  const repoRoot = resolve(fileURLToPath(new URL("../../../../", import.meta.url)));
  const startScript = await readFile(resolve(repoRoot, "services/simpeg/start.sh"), "utf8");
  const dockerfile = await readFile(resolve(repoRoot, "services/simpeg/Dockerfile"), "utf8");

  const migrationCommand = "./services/simpeg/api/node_modules/.bin/prisma migrate deploy --schema services/simpeg/api/prisma/schema.prisma";
  const migrateIndex = startScript.indexOf(migrationCommand);
  const apiIndex = startScript.indexOf("node services/simpeg/api/dist/main.js");

  assert(migrateIndex >= 0, "SIMPEG start.sh must deploy versioned Prisma migrations through the service-local binary before serving traffic");
  assert(apiIndex >= 0 && migrateIndex < apiIndex, "Prisma migration deployment must run before the API process starts");
  assert(!/pnpm\s+--filter\s+@alfida\/simpeg-api\s+exec\s+prisma\s+migrate\s+deploy/.test(startScript), "startup must not invoke Prisma through pnpm against the root node_modules");
  assert(!/^\s*(?:pnpm|npx).*prisma db push/m.test(startScript), "production startup must not use prisma db push");
  assert(startScript.includes("services/simpeg/web/.next/static"), "startup must preserve standalone Next.js static asset handling");
  assert(startScript.includes("services/simpeg/web/public"), "startup must preserve standalone Next.js public asset handling");
  assert(startScript.includes("services/simpeg/api/src/generated"), "startup must preserve the generated Prisma fallback");
  assert(dockerfile.includes("apk add --no-cache libc6-compat openssl"), "Alpine image must include OpenSSL for Prisma");
  assert(dockerfile.includes("COPY --from=builder --chown=appuser:nodejs /app ./"), "runner files must be readable by appuser");

  console.log("SIMPEG Prisma deployment lifecycle contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
