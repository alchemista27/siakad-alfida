import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../../..");
const manifest = JSON.parse(readFileSync(resolve(root, "services/simpeg/api/package.json"), "utf8")) as { name: string };
const dockerfile = readFileSync(resolve(root, "services/simpeg/Dockerfile"), "utf8");
assert.ok(dockerfile.includes(`RUN pnpm --filter ${manifest.name} exec prisma generate`), "Dockerfile must generate the exact SIMPEG API workspace package");
assert.ok(dockerfile.includes(`RUN pnpm --filter ${manifest.name} build`), "Dockerfile must build the exact SIMPEG API workspace package");
console.log("SIMPEG Dockerfile package filter contract passed");
