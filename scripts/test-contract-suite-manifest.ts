import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const runnerPath = resolve(root, "scripts/test-contract-suite.mjs");

function discover(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) return discover(full);
    return /^test-.*\.ts$/.test(entry.name) ? [full] : [];
  });
}

assert.equal(existsSync(runnerPath), true, "missing scripts/test-contract-suite.mjs");
const runner = readFileSync(runnerPath, "utf8");
assert.match(runner, /discoverContractTests/, "runner must discover every scripts/test-*.ts contract");
assert.match(runner, /pnpm/, "runner must execute contract scripts with pnpm");

const servicesRoot = resolve(root, "services");
const contracts = discover(servicesRoot);
assert(contracts.length > 0, "expected at least one service contract test");
assert.match(runner, /test-.*\\\.ts/, "runner must select test-*.ts scripts only");
assert.match(runner, /@contract-test: external/, "runner must skip explicitly marked external-state scripts");

for (const externalPath of [
  "services/admin/api/scripts/test-admin-api.ts",
  "services/auth/api/scripts/test-registration.ts",
  "services/simakin/api/scripts/test-rankings.ts",
]) {
  const content = readFileSync(resolve(root, externalPath), "utf8");
  assert.match(content, /@contract-test: external/, `${externalPath} must be marked external-state`);
}

console.log(`Contract suite manifest passed (${contracts.length} discovered contract tests)`);
