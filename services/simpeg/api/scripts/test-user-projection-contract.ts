import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const source = await readFile(resolve(process.cwd(), "src/employees/employees.service.ts"), "utf8");
  assert.match(source, /async syncUser\(dto: SyncUserDto\)[\s\S]*?this\.prisma\.user\.upsert/, "SIMPEG must receive users through an idempotent local projection");
  assert.doesNotMatch(source, /passwordHash|accounts:|session|token/i, "SIMPEG user projection must not own credential/session fields");
  console.log("SIMPEG user projection boundary contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
