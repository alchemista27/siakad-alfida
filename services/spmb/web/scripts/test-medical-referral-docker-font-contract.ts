import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../../../..", import.meta.url));

async function main() {
  const [dockerignore, dockerfile] = await Promise.all([
    readFile(`${repositoryRoot}/.dockerignore`, "utf8"),
    readFile(`${repositoryRoot}/services/spmb/Dockerfile`, "utf8"),
  ]);

  assert.match(
    dockerignore,
    /^!services\/spmb\/web\/assets\/fonts\/LiberationSerif-Regular\.ttf$/m,
    "SPMB's regular Liberation Serif face must be included in the Docker build context",
  );
  assert.match(
    dockerignore,
    /^!services\/spmb\/web\/assets\/fonts\/LiberationSerif-Bold\.ttf$/m,
    "SPMB's bold Liberation Serif face must be included in the Docker build context",
  );
  assert.match(
    dockerfile,
    /COPY --from=builder --chown=appuser:nodejs \/app \.\//,
    "the runner image must copy the built font assets from the builder stage",
  );

  console.log("SPMB medical referral Docker font contract passed");
}

void main();
