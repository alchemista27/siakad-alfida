import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../../..");
const dockerfile = readFileSync(resolve(root, "services/simpeg/Dockerfile"), "utf8");
const dockerignore = readFileSync(resolve(root, ".dockerignore"), "utf8");

assert.match(
  dockerfile,
  /apk add --no-cache python3 py3-pip tzdata font-liberation/,
  "SIMPEG runner must install Liberation Serif for attendance PDF rendering",
);

assert.match(
  dockerignore,
  /!services\/simpeg\/api\/assets\/fonts\/LiberationSerif-Regular\.ttf/,
  "SIMPEG Liberation Serif assets must survive the Docker build context",
);

console.log("SIMPEG attendance PDF runtime contract passed");
