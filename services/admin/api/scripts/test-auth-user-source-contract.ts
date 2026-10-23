import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const source = await readFile(resolve(process.cwd(), "src/users/users.service.ts"), "utf8");
  assert.match(source, /this\.prisma\.user\.create\([\s\S]*?passwordHash[\s\S]*?accounts:\s*\{[\s\S]*?providerId:\s*"credential"[\s\S]*?roles:\s*\{/, "Admin must create the canonical Auth user, credential account, and role assignment together");
  assert.match(source, /orderBy:\s*\{\s*createdAt:\s*"desc"\s*\}/, "Admin user list must order newest accounts first");
  assert.doesNotMatch(source, /simpeg.*\.user\.create|SIMPEG_DATABASE_URL/i, "Admin must not create SIMPEG user copies directly");
  console.log("Admin Auth user-source contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
