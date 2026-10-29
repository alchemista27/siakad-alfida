import assert from "node:assert/strict";
import { BadGatewayException } from "@nestjs/common";
import { FoundationBrandingClient } from "../src/letters/foundation-branding.client";

async function main() {
  const original = process.env.ADMIN_PUBLIC_API_URL;
  process.env.ADMIN_PUBLIC_API_URL = "https://admin.example.test/";
  try {
    const client = new FoundationBrandingClient((async (url: string) => {
      assert.equal(url, "https://admin.example.test/api/public/foundation-settings");
      return Response.json({
        foundationName: "Yayasan Alfida",
        logoUrl: "https://s3.example.test/sim-alfida/foundation/logo.png",
      });
    }) as typeof fetch);
    assert.deepEqual(await client.getBranding(), {
      foundationName: "Yayasan Alfida",
      logoUrl: "https://s3.example.test/sim-alfida/foundation/logo.png",
    });

    const malformed = new FoundationBrandingClient((async () => Response.json({
      foundationName: "Yayasan Alfida",
      logoUrl: { invalid: true },
    })) as typeof fetch);
    await assert.rejects(() => malformed.getBranding(), BadGatewayException);
    console.log("SPMB foundation branding client contract passed");
  } finally {
    if (original === undefined) delete process.env.ADMIN_PUBLIC_API_URL;
    else process.env.ADMIN_PUBLIC_API_URL = original;
  }
}

void main();
