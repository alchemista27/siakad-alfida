import { expect, test } from "@playwright/test";
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  COMPLETE_UNIT_ID,
  FOUNDATION_FALLBACK_ID,
  INVALID_MODE_ID,
  MEDICAL_FOUNDATION_ID,
} from "./letterhead-fixtures";

async function inspectPdf(bytes: Buffer) {
  expect(bytes.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  const loadingTask = getDocument({ data: new Uint8Array(bytes) });
  const document = await loadingTask.promise;

  try {
    const page = await document.getPage(1);
    const textContent = await page.getTextContent();
    const operatorList = await page.getOperatorList();
    const text = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ");
    const imagePaints = operatorList.fnArray.filter((operator) => operator === OPS.paintImageXObject).length;
    return { text, imagePaints };
  } finally {
    await loadingTask.destroy();
  }
}

test.beforeEach(async ({ context }) => {
  await context.addCookies([{
    name: "alfida_session",
    value: "playwright-e2e-session",
    url: "http://127.0.0.1:3100",
  }]);
});

test("accepted parent downloads a complete-unit acceptance letter", async ({ page }) => {
  await page.goto(`/parent/result?registrationId=${COMPLETE_UNIT_ID}`);
  const link = page.getByRole("link", { name: "Unduh Surat Keterangan Diterima" });
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  expect(href).toBe(`/api/pdf/acceptance?registrationId=${COMPLETE_UNIT_ID}`);

  const response = await page.request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect(response.headers()["content-disposition"]).toContain("surat-diterima-REG-E2E-UNIT.pdf");

  const pdf = await inspectPdf(await response.body());
  expect(pdf.text).toContain("SDIT Iqra E2E");
  expect(pdf.text).toContain("Jl. Unit Lengkap No. 1");
  expect(pdf.text).not.toContain("Jl. Yayasan E2E No. 1");
  expect(pdf.imagePaints).toBeGreaterThanOrEqual(2);
});

test("incomplete-unit acceptance letter falls back to foundation identity", async ({ page }) => {
  const response = await page.request.get(`/api/pdf/acceptance?registrationId=${FOUNDATION_FALLBACK_ID}`);
  expect(response.status()).toBe(200);
  const pdf = await inspectPdf(await response.body());
  expect(pdf.text).toContain("Yayasan Alfida E2E");
  expect(pdf.text).toContain("Jl. Yayasan E2E No. 1");
  expect(pdf.text).not.toContain("SDIT Identitas Belum Lengkap");
  expect(pdf.imagePaints).toBeGreaterThanOrEqual(1);
});

test("parent downloads foundation-mode medical referral with QR", async ({ page }) => {
  await page.goto(`/parent/medical?registrationId=${MEDICAL_FOUNDATION_ID}`);
  const link = page.getByRole("link", { name: "Surat Pengantar Pemeriksaan Kesehatan" });
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  expect(href).toBe(`/api/pdf/medical-referral?registrationId=${MEDICAL_FOUNDATION_ID}`);

  const response = await page.request.get(href!);
  expect(response.status()).toBe(200);
  const pdf = await inspectPdf(await response.body());
  expect(pdf.text).toContain("SURAT PENGANTAR PEMERIKSAAN KESEHATAN");
  expect(pdf.text).toContain("Yayasan Alfida E2E");
  expect(pdf.text).not.toContain("SDIT Identitas Belum Lengkap");
  expect(pdf.imagePaints).toBeGreaterThanOrEqual(2);
});

test("malformed upstream letterhead mode is rejected", async ({ page }) => {
  const response = await page.request.get(`/api/pdf/acceptance?registrationId=${INVALID_MODE_ID}`);
  expect(response.status()).toBe(502);
  await expect(response.json()).resolves.toEqual({ message: "Data surat keterangan tidak valid." });
});
