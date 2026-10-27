import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const forbidden = /ppdb|siswa|santri/i;
const ignoredDirectoryNames = new Set(["generated", "dist", ".next", "node_modules"]);

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return ignoredDirectoryNames.has(entry.name) ? [] : walk(path);
    return /\.(ts|tsx|md)$/.test(entry.name) ? [path] : [];
  });
}

for (const file of walk(resolve(root, "src")).concat(walk(resolve(root, "scripts")))) {
  if (file.endsWith("test-spmb-terminology-contract.ts")) continue;
  const inspected = readFileSync(file, "utf8").replaceAll("tim_ppdb", "tim_spmb");
  const match = inspected.match(forbidden);
  assert(!match, `forbidden terminology ${match?.[0]} in ${relative(root, file)}`);
}

console.log("SPMB Web terminology contract passed");
