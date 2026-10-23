import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const [source, service] = await Promise.all([
    readFile(resolve(process.cwd(), "src/app/users/page.tsx"), "utf8"),
    readFile(resolve(process.cwd(), "../api/src/users/users.service.ts"), "utf8"),
  ]);

  assert.match(source, /const fetchUsers = async \(pageOverride = page\)/, "user refresh must support loading a known page");
  assert.match(source, /if \(!res\.ok\)[\s\S]{0,220}throw new Error\(/, "non-OK user-list responses must be visible errors");
  assert.match(source, /setPage\(1\);[\s\S]{0,180}fetchUsers\(1\)/, "manual create must return to page one before reloading newest users");
  assert.match(service, /orderBy:\s*\{\s*createdAt:\s*"desc"\s*\}/, "API must keep newest accounts at the top");

  console.log("Admin user-list visibility contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
