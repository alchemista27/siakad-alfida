#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { resolve, relative, dirname } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const filter = process.env.CONTRACT_TEST_FILTER ? new RegExp(process.env.CONTRACT_TEST_FILTER) : null;

function discoverContractTests(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) return discoverContractTests(fullPath);
    return /^test-.*\.ts$/.test(entry.name) ? [fullPath] : [];
  });
}

function isExternalStateTest(path) {
  return readFileSync(path, "utf8").includes("@contract-test: external");
}

const tests = discoverContractTests(resolve(root, "services"))
  .filter((path) => !isExternalStateTest(path))
  .filter((path) => !filter || filter.test(relative(root, path)))
  .sort();

if (!tests.length) {
  console.error("No contract tests matched.");
  process.exit(1);
}

for (const testPath of tests) {
  const display = relative(root, testPath);
  process.stdout.write(`== ${display} ==\n`);
  const result = spawnSync("pnpm", ["exec", "tsx", testPath], {
    cwd: dirname(dirname(testPath)),
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Contract suite passed (${tests.length} tests)`);
