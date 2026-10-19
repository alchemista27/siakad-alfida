import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { fileURLToPath } from "node:url";

async function main() {
  const repoRoot = resolve(fileURLToPath(new URL("../../../../", import.meta.url)));
  const startScript = await readFile(resolve(repoRoot, "services/siakad/start.sh"), "utf8");
  const dockerfile = await readFile(resolve(repoRoot, "services/siakad/Dockerfile"), "utf8");

  const migrateIndex = startScript.indexOf("prisma migrate deploy");
  const apiIndex = startScript.indexOf("node services/siakad/api/dist/main.js");
  assert(migrateIndex >= 0, "SIAKAD start.sh must run prisma migrate deploy before serving traffic");
  assert(apiIndex >= 0 && migrateIndex < apiIndex, "prisma migrate deploy must run before the API process starts");
  assert(!/^\s*(?:pnpm|npx).*prisma db push/m.test(startScript), "production startup must not use prisma db push");
  assert(dockerfile.includes("pnpm --filter siakad-api exec prisma generate"), "Docker build must generate the SIAKAD Prisma client");

  console.log("SIAKAD Prisma deployment lifecycle contract passed");
}

void main();
