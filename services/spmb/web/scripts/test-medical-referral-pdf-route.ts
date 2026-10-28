import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET } from "../src/app/api/pdf/medical-referral/route";

const originalFetch = globalThis.fetch;

const letter = {
  referralNumber: "SPMB-MED-2026-ABCD1234",
  issuedAt: "2026-10-28T00:00:00.000Z",
  registrationNumber: "SPMB-2026-SDIT-0001",
  unitName: "SDIT Alfida",
  academicYearLabel: "2026/2027",
  studentName: "<script>alert(1)</script>",
  gender: "male",
  birthPlace: "Bekasi",
  birthDate: "2019-04-10T00:00:00.000Z",
  unitLogoUrl: "https://assets.test/unit.png",
  principalName: "Siti Aminah",
  principalSignatureUrl: "https://assets.test/signature.png",
  foundationName: "Yayasan Alfida",
  foundationLogoUrl: "https://assets.test/foundation.png",
};

async function main() {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/letters/medical-referral/")) return Response.json(letter);
    return new Response(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGP4DwQACfsD/fteaysAAAAASUVORK5CYII=", "base64"), { headers: { "content-type": "image/png" } });
  }) as typeof fetch;

  try {
    const response = await GET(new NextRequest("https://spmb.test/api/pdf/medical-referral?registrationId=abc"));
    const bytes = new Uint8Array(await response.arrayBuffer());
    const decoded = new TextDecoder().decode(bytes);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") || "", /^application\/pdf\b/i);
    assert.equal(new TextDecoder().decode(bytes.slice(0, 5)), "%PDF-");
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(decoded.includes("<script>"), false, "hostile HTML must never be emitted as executable markup");
    console.log("SPMB medical referral PDF route contract passed");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

void main();
