import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const controller = readFileSync(resolve(__dirname, "../src/strategic/organization-sync/users.controller.ts"), "utf8");
assert.match(
  controller,
  /sourceUpdatedAt:\s*z\.string\(\)\.datetime\(\)/,
  "SIMAKIN must validate and preserve the source update version in user sync payloads",
);
console.log("SIMAKIN user projection payload contract passed");
