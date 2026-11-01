import assert from "node:assert/strict";
import { ServiceUnavailableException } from "@nestjs/common";
import { SimpegUnitCatalogClient } from "../src/auth/simpeg-unit-catalog.client";

const previousUrl = process.env.SIMPEG_API_URL;
const previousInternalUrl = process.env.INTERNAL_SIMPEG_API_URL;
const previousToken = process.env.INTERNAL_SERVICE_SECRET;

function restoreEnvironment() {
  if (previousUrl === undefined) delete process.env.SIMPEG_API_URL;
  else process.env.SIMPEG_API_URL = previousUrl;
  if (previousInternalUrl === undefined) delete process.env.INTERNAL_SIMPEG_API_URL;
  else process.env.INTERNAL_SIMPEG_API_URL = previousInternalUrl;
  if (previousToken === undefined) delete process.env.INTERNAL_SERVICE_SECRET;
  else process.env.INTERNAL_SERVICE_SECRET = previousToken;
}

async function main() {
  const requests: Array<{ input: URL | RequestInfo; init?: RequestInit }> = [];
  const client = new SimpegUnitCatalogClient(async (input, init) => {
    requests.push({ input, init });
    return Response.json([
      { id: "unit-lksa", name: "LKSA Asrama Yatim Alfida" },
      { id: "unit-lazis", name: "LAZIS Alfida" },
    ]);
  });

  delete process.env.SIMPEG_API_URL;
  delete process.env.INTERNAL_SIMPEG_API_URL;
  delete process.env.INTERNAL_SERVICE_SECRET;
  await assert.rejects(() => client.listActive(), ServiceUnavailableException, "missing configuration must fail before fetch");
  assert.equal(requests.length, 0);

  process.env.INTERNAL_SIMPEG_API_URL = "https://simpeg.internal.example.test/";
  process.env.SIMPEG_API_URL = "https://simpeg-public.example.test/";
  process.env.INTERNAL_SERVICE_SECRET = "test-internal-token";
  assert.deepEqual(await client.listActive(), [
    { id: "unit-lksa", name: "LKSA Asrama Yatim Alfida" },
    { id: "unit-lazis", name: "LAZIS Alfida" },
  ]);
  assert.equal(String(requests[0]?.input), "https://simpeg.internal.example.test/api/internal/units/active");
  assert.equal((requests[0]?.init?.headers as Record<string, string>)["x-internal-service-key"], "test-internal-token");
  assert.equal((requests[0]?.init?.method), "GET");

  const malformed = new SimpegUnitCatalogClient(async () => Response.json([{ id: "bad" }]));
  await assert.rejects(() => malformed.listActive(), ServiceUnavailableException, "malformed catalog data must fail closed");

  const unavailable = new SimpegUnitCatalogClient(async () => new Response(null, { status: 503 }));
  await assert.rejects(() => unavailable.listActive(), ServiceUnavailableException, "non-success responses must fail closed");

  restoreEnvironment();
  console.log("Auth SIMPEG unit-catalog client contract passed");
}

main().catch((error) => {
  restoreEnvironment();
  console.error(error);
  process.exitCode = 1;
});
