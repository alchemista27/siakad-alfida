import assert from "node:assert/strict";
import { SimpegUnitCatalogClient } from "../src/dashboard/simpeg-unit-catalog.client";

const units = [
  { id: "22222222-2222-4222-8222-222222222222", name: "Unit B" },
  { id: "11111111-1111-4111-8111-111111111111", name: "Unit A" },
];

async function main() {
  const previousUrl = process.env.SIMPEG_INTERNAL_API_URL;
  const previousSecret = process.env.INTERNAL_SERVICE_SECRET;
  process.env.SIMPEG_INTERNAL_API_URL = "https://simpeg.internal.test";
  process.env.INTERNAL_SERVICE_SECRET = "test-internal-secret";

  try {
    const requests: Array<{ path: string; secret: string | null }> = [];
    const client = new SimpegUnitCatalogClient(async (url, init) => {
      requests.push({
        path: new URL(url).pathname,
        secret: new Headers(init?.headers).get("x-internal-service-key"),
      });
      return Response.json(units);
    });

    assert.deepEqual(await client.listActive(), [units[1], units[0]]);
    assert.deepEqual(requests, [{
      path: "/api/internal/units/active",
      secret: "test-internal-secret",
    }]);

    const malformed = new SimpegUnitCatalogClient(async () => Response.json([{ id: units[0].id, name: "" }]));
    await assert.rejects(() => malformed.listActive(), /katalog unit aktif SIMPEG/i);
  } finally {
    if (previousUrl === undefined) delete process.env.SIMPEG_INTERNAL_API_URL;
    else process.env.SIMPEG_INTERNAL_API_URL = previousUrl;
    if (previousSecret === undefined) delete process.env.INTERNAL_SERVICE_SECRET;
    else process.env.INTERNAL_SERVICE_SECRET = previousSecret;
  }

  console.log("SIYAUM SIMPEG active unit catalog client contract passed");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
