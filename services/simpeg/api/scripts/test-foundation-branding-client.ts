import assert from "node:assert/strict";
import { FoundationBrandingClient } from "../src/attendance/foundation-branding.client";

async function main() {
  const originalPublic = process.env.ADMIN_PUBLIC_API_URL;
  const originalInternal = process.env.INTERNAL_ADMIN_API_URL;
  try {
    process.env.ADMIN_PUBLIC_API_URL = "https://admin.example.test/";
    process.env.INTERNAL_ADMIN_API_URL = "http://admin-internal.example.test";
    const calls: string[] = [];
    const client = new FoundationBrandingClient(async (input) => {
      const url = String(input);
      calls.push(url);
      if (url.endsWith("/api/public/foundation-settings")) {
        return new Response(JSON.stringify({ foundationName: "Yayasan Contoh", logoUrl: "https://res.cloudinary.com/hb1ropwm/image/upload/foundation/logo/report.png" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(Buffer.from("png"), { status: 200, headers: { "content-type": "image/png", "content-length": "3" } });
    });
    const branding = await client.getForPdf();
    assert.equal(branding.foundationName, "Yayasan Contoh");
    assert.deepEqual(branding.logo, Buffer.from("png"));
    assert.equal(calls[0], "https://admin.example.test/api/public/foundation-settings");

    const fallback = new FoundationBrandingClient(async () => new Response("unavailable", { status: 503 }));
    assert.deepEqual(await fallback.getForPdf(), { foundationName: "Yayasan Alfida", logoUrl: null, logo: null });

    const unsafeLogo = new FoundationBrandingClient(async () => new Response(JSON.stringify({ foundationName: "Yayasan", logoUrl: "http://127.0.0.1/private.png" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    assert.deepEqual(await unsafeLogo.getForPdf(), { foundationName: "Yayasan", logoUrl: null, logo: null });
  } finally {
    if (originalPublic === undefined) delete process.env.ADMIN_PUBLIC_API_URL;
    else process.env.ADMIN_PUBLIC_API_URL = originalPublic;
    if (originalInternal === undefined) delete process.env.INTERNAL_ADMIN_API_URL;
    else process.env.INTERNAL_ADMIN_API_URL = originalInternal;
  }
  console.log("SIMPEG foundation branding client contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
