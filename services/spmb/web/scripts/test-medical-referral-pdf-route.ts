import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NextRequest } from "next/server";
import { GET } from "../src/app/api/pdf/medical-referral/route";
import { isSupportedPdfRaster } from "../src/lib/letters/medical-referral-pdf";

const originalFetch = globalThis.fetch;
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGP4DwQACfsD/fteaysAAAAASUVORK5CYII=",
  "base64",
);

const letter = {
  referralNumber: "SPMB-MED-2026-ABCD1234",
  verificationToken: "a".repeat(64),
  issuedAt: "2026-10-28T00:00:00.000Z",
  registrationNumber: "SPMB-2026-SDIT-0001",
  unitName: "SDIT Alfida",
  academicYearLabel: "2026/2027",
  studentName: "<script>alert(1)</script>",
  gender: "male",
  birthPlace: "Bekasi",
  birthDate: "2019-04-10T00:00:00.000Z",
  unitAddress: null,
  unitPhone: null,
  unitEmail: null,
  unitLogoUrl: null,
  foundationName: "Yayasan Alfida",
  foundationLogoUrl: "https://s3.alfida.or.id/sim-alfida/foundation/logo.png",
};

async function main() {
  let medicalLetterRequestUrl = "";
  const imageUrls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/letters/medical-referral/")) {
      medicalLetterRequestUrl = url;
      return Response.json(letter);
    }
    if (url.includes("/foundation/logo.png")) {
      return new Response(PNG_1X1, { headers: { "content-type": "application/octet-stream" } });
    }
    imageUrls.push(url);
    return new Response("not found", { status: 404, headers: { "content-type": "text/plain" } });
  }) as typeof fetch;

  try {
    const response = await GET(new NextRequest("https://spmb.test/api/pdf/medical-referral?registrationId=abc"));
    const bytes = new Uint8Array(await response.arrayBuffer());
    const decoded = new TextDecoder().decode(bytes);
    assert.equal(response.status, 200, "a missing remote logo must not block the PDF");
    assert.match(medicalLetterRequestUrl, /^http:\/\/127\.0\.0\.1:3001\/api\/letters\/medical-referral\//, "co-located SPMB API must use its runtime port by default");
    assert.match(response.headers.get("content-type") || "", /^application\/pdf\b/i);
    assert.equal(new TextDecoder().decode(bytes.slice(0, 5)), "%PDF-");
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(decoded.includes("<script>"), false, "hostile HTML must never be emitted as executable markup");
    assert.equal(imageUrls.some((url) => url.includes("signature")), false, "PDF must not fetch a handwritten signature image");
    assert.equal(isSupportedPdfRaster(PNG_1X1), true, "a valid PNG must be accepted even when object storage reports octet-stream");
    assert.equal(isSupportedPdfRaster(Buffer.from("not-an-image")), false, "arbitrary binary must remain rejected");
    assert.equal(imageUrls.some((url) => url.includes("/foundation/logo.png")), false, "the configured foundation logo must be consumed as a valid asset");
    const pdfSource = readFileSync(resolve(process.cwd(), "src/lib/letters/medical-referral-pdf.ts"), "utf8");
    const routeSource = readFileSync(resolve(process.cwd(), "src/app/api/pdf/medical-referral/route.ts"), "utf8");
    assert.match(pdfSource, /QRCode\.toBuffer/, "PDF must render an authenticity QR code");
    assert.match(pdfSource, /optionalImageBytes/, "each remote letterhead image must be optional");
    assert.match(pdfSource, /verificationUrl/, "PDF must consume the verification URL");
    assert.match(pdfSource, /Times-Roman/, "medical referral body must use Times-Roman");
    assert.match(pdfSource, /Times-Bold/, "medical referral headings must use Times-Bold");
    assert.match(pdfSource, /Klinik IMC/, "recipient must explicitly name Klinik IMC");
    assert.doesNotMatch(pdfSource, /Petugas Pemeriksaan Kesehatan/, "generic clinic recipient copy must be removed");
    assert.match(pdfSource, /const QR_TOP_OFFSET = 58/, "QR layout must use a deliberate vertical offset from the date");
    assert.match(pdfSource, /verificationTop \+ QR_TOP_OFFSET/, "QR placement must use the declared offset");
    assert.match(routeSource, /\/verify\/medical-referral\//, "PDF route must build a same-origin verification URL");
    assert.match(routeSource, /nullableStrings\s*=\s*\[[^\]]*"foundationLogoUrl"/, "route must accept a missing foundation logo");
    assert.doesNotMatch(routeSource, /Aset kop surat tidak dapat dimuat/, "route must not expose asset loading as a hard failure");
    assert.doesNotMatch(pdfSource, /signatorySignatureUrl|signatoryTitle/, "PDF must not render a signature block");
    console.log("SPMB medical referral PDF route contract passed");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

void main();
