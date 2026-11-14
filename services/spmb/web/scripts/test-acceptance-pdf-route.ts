import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NextRequest } from "next/server";
import { GET } from "../src/app/api/pdf/acceptance/route";

const originalFetch = globalThis.fetch;

type UpstreamLetter = {
  registrationNumber: string;
  unitName: string;
  academicYearLabel: string;
  studentName: string;
  decisionNote: string | null;
  issuedAt: string;
  unitAddress: string | null;
  unitPhone: string | null;
  unitEmail: string | null;
  unitLogoUrl: string | null;
  letterheadKind: "unit" | "foundation";
  foundationName: string;
  foundationAddress: string | null;
  foundationPhone: string | null;
  foundationEmail: string | null;
  foundationLogoUrl: string | null;
};

const letter: UpstreamLetter = {
  registrationNumber: "REG-2026-0001",
  unitName: "SDIT Iqra",
  academicYearLabel: "2026/2027",
  studentName: '<img src=x onerror="alert(1)">',
  decisionNote: "<script>alert(1)</script>",
  issuedAt: "2026-06-01T08:00:00.000Z",
  unitAddress: "Jl. Pendidikan No. 1",
  unitPhone: "021-123456",
  unitEmail: "sdit@example.test",
  unitLogoUrl: "https://res.cloudinary.com/example/image/upload/spmb/unit/unit-1/logo.png",
  letterheadKind: "unit",
  foundationName: "Yayasan Alfida",
  foundationAddress: "Jl. Yayasan No. 1",
  foundationPhone: "021-999999",
  foundationEmail: "info@alfida.example",
  foundationLogoUrl: "https://res.cloudinary.com/example/image/upload/foundation/logo/alfida.png",
};

const png = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41,
  0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0xf0,
  0x1f, 0x00, 0x05, 0x00, 0x01, 0xff, 0x89, 0x99,
  0x3d, 0x1d, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
  0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

async function run() {
  globalThis.fetch = (async (url: string | URL) => {
    const target = String(url);
    if (target.includes("/api/letters/acceptance/")) return Response.json(letter);
    if (target.includes("res.cloudinary.com")) {
      return new Response(png, { headers: { "content-type": "image/png" } });
    }
    throw new Error(`unexpected request: ${target}`);
  }) as typeof fetch;

  try {
    const response = await GET(new NextRequest("https://spmb.test/api/pdf/acceptance?registrationId=abc"));
    const body = new Uint8Array(await response.arrayBuffer());
    const decoded = new TextDecoder().decode(body);

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") || "", /^application\/pdf\b/i, "route must return a PDF");
    assert.equal(decoded.startsWith("%PDF-"), true, "PDF response must start with %PDF-");
    assert.match(decoded, /\/Subtype\s*\/Image\b/, "formal acceptance PDF must embed at least one available letterhead logo");
    assert.equal(decoded.includes("<script>"), false, "untrusted HTML must not be emitted as executable markup");
    assert.equal(decoded.includes("<img"), false, "untrusted HTML must not be emitted as executable markup");

    const rendererSource = readFileSync(resolve(process.cwd(), "src/lib/letters/acceptance-pdf.ts"), "utf8");
    const letterheadSource = readFileSync(resolve(process.cwd(), "src/lib/letters/letterhead.ts"), "utf8");
    assert.match(letterheadSource, /drawInstitutionalLetterhead/, "acceptance PDF must use the shared institutional letterhead renderer");
    assert.match(letterheadSource, /letterheadKind/, "letterhead renderer must support the server-selected header mode");
    assert.match(letterheadSource, /foundationAddress/, "foundation fallback must render foundation identity");
    assert.match(rendererSource, /drawInstitutionalLetterhead/, "acceptance PDF must delegate its header to the shared renderer");
    assert.match(rendererSource, /LiberationSerif-Regular\.ttf/, "acceptance PDF must embed Liberation Serif Regular");
    assert.match(rendererSource, /LiberationSerif-Bold\.ttf/, "acceptance PDF must embed Liberation Serif Bold");
    assert.doesNotMatch(rendererSource, /BaseFont\s*\/Helvetica|Times-Roman|Times-Bold/, "acceptance PDF must not use Base-14 Helvetica/Times");
    assert.match(rendererSource, /Perihal: Pemberitahuan Hasil Seleksi SPMB/, "acceptance PDF must render the official subject line");
    assert.match(rendererSource, /Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya\./, "acceptance PDF must render the official closing");

    globalThis.fetch = (async () => Response.json({ ...letter, unitLogoUrl: 42 })) as typeof fetch;
    const malformed = await GET(new NextRequest("https://spmb.test/api/pdf/acceptance?registrationId=abc"));
    assert.equal(malformed.status, 502, "malformed branding payload must be rejected before PDF rendering");

    globalThis.fetch = (async () => Response.json({ ...letter, letterheadKind: "invalid" })) as typeof fetch;
    const invalidMode = await GET(new NextRequest("https://spmb.test/api/pdf/acceptance?registrationId=abc"));
    assert.equal(invalidMode.status, 502, "unknown letterhead mode must be rejected before PDF rendering");

    console.log("SPMB acceptance PDF route contract passed");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

void run();
