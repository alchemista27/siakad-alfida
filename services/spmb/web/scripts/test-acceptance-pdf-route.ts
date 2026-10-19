import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET } from "../src/app/api/pdf/acceptance/route";

const originalFetch = globalThis.fetch;

type UpstreamLetter = {
  registrationNumber: string;
  unitName: string;
  academicYearLabel: string;
  studentName: string;
  decisionNote: string | null;
};

const letter: UpstreamLetter = {
  registrationNumber: "REG-2026-0001",
  unitName: "SDIT Iqra",
  academicYearLabel: "2026/2027",
  studentName: '<img src=x onerror="alert(1)">',
  decisionNote: "<script>alert(1)</script>",
};

async function run() {
  globalThis.fetch = (async () => Response.json(letter)) as typeof fetch;

  try {
    const response = await GET(new NextRequest("https://spmb.test/api/pdf/acceptance?registrationId=abc"));
    const body = new Uint8Array(await response.arrayBuffer());
    const decoded = new TextDecoder().decode(body);

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") || "", /^application\/pdf\b/i, "route must return a PDF");
    assert.equal(decoded.startsWith("%PDF-"), true, "PDF response must start with %PDF-");
    assert.equal(decoded.includes("<script>"), false, "untrusted HTML must not be emitted as executable markup");
    assert.equal(decoded.includes("<img"), false, "untrusted HTML must not be emitted as executable markup");

    console.log("SPMB acceptance PDF route contract passed");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

void run();
