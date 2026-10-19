import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

async function main() {
  const repoRoot = resolve(fileURLToPath(new URL("../../../../", import.meta.url)));
  const startScript = await readFile(resolve(repoRoot, "services/simpeg/start.sh"), "utf8");
  const dockerfile = await readFile(resolve(repoRoot, "services/simpeg/Dockerfile"), "utf8");

  const migrationCommand = "pnpm --filter @alfida/simpeg-api exec prisma migrate deploy --schema services/simpeg/api/prisma/schema.prisma";
  const migrateIndex = startScript.indexOf(migrationCommand);
  const apiIndex = startScript.indexOf("node services/simpeg/api/dist/main.js");

  assert(migrateIndex >= 0, "SIMPEG start.sh must deploy versioned Prisma migrations before serving traffic");
  assert(apiIndex >= 0 && migrateIndex < apiIndex, "Prisma migration deployment must run before the API process starts");
  assert(!/^\s*(?:pnpm|npx).*prisma db push/m.test(startScript), "production startup must not use prisma db push");
  assert(startScript.includes("services/simpeg/web/.next/static"), "startup must preserve standalone Next.js static asset handling");
  assert(startScript.includes("services/simpeg/web/public"), "startup must preserve standalone Next.js public asset handling");
  assert(dockerfile.includes("apk add --no-cache libc6-compat openssl"), "Alpine image must include OpenSSL for Prisma");

  console.log("SIMPEG Prisma deployment lifecycle contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
