import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dockerfile = readFileSync(resolve(import.meta.dirname, "../../Dockerfile"), "utf8");
assert.match(
  dockerfile,
  /apk add --no-cache python3 py3-pip tzdata/,
  "the fingerprint runtime must include tzdata so ZoneInfo('Asia/Jakarta') works in Alpine",
);
console.log("SIMPEG fingerprint runtime timezone contract passed");
