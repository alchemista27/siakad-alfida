import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const [dockerfile, start] = await Promise.all([
    readFile(resolve(process.cwd(), "../Dockerfile"), "utf8"),
    readFile(resolve(process.cwd(), "../start.sh"), "utf8"),
  ]);

  assert.match(dockerfile, /pnpm --filter @alfida\/siskeu-web build/, "Docker image must build the web application");
  assert.match(dockerfile, /EXPOSE 3000/, "Coolify must receive the web port");
  assert.match(start, /prisma migrate deploy[\s\S]*node services\/siskeu\/api\/dist\/main\.js/, "migration must complete before API starts");
  assert.match(start, /HOSTNAME=0\.0\.0\.0 PORT=3000 node services\/siskeu\/web\/\.next\/standalone\/services\/siskeu\/web\/server\.js/, "web server must bind for Traefik");

  console.log("SISKEU deployment lifecycle contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
