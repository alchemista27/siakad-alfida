import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const expected = "FROM node:22.23.4-alpine AS base";
const dockerfiles = [
  "Dockerfile",
  "services/admin/Dockerfile",
  "services/auth/Dockerfile",
  "services/siakad/Dockerfile",
  "services/simakin/Dockerfile",
  "services/simpeg/Dockerfile",
  "services/siskeu/Dockerfile",
  "services/siyaum/Dockerfile",
  "services/spmb/Dockerfile",
];

for (const relativePath of dockerfiles) {
  const dockerfile = readFileSync(resolve(root, relativePath), "utf8");
  assert.ok(
    dockerfile.startsWith(expected),
    `${relativePath} must begin with ${expected}`,
  );
}

console.log(`Node2Shell Docker runtime pin contract passed (${dockerfiles.length} Dockerfiles)`);
