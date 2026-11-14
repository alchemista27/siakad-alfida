import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import PDFDocument from "pdfkit";
import {
  drawInstitutionalLetterhead,
  getLetterheadIssuerName,
  prepareLetterheadAssets,
  type InstitutionalLetterheadInput,
} from "./letterhead";

export type AcceptanceLetterPdfInput = InstitutionalLetterheadInput & {
  registrationNumber: string;
  academicYearLabel: string;
  studentName: string;
  decisionNote: string | null;
  issuedAt: string;
};

const PDF_FONT_REGULAR = "LiberationSerifRegular";
const PDF_FONT_BOLD = "LiberationSerifBold";
const FONT_DIRECTORY = existsSync(join(process.cwd(), "assets/fonts"))
  ? join(process.cwd(), "assets/fonts")
  : join(process.cwd(), "services/spmb/web/assets/fonts");
const FONT_REGULAR_PATH = join(FONT_DIRECTORY, "LiberationSerif-Regular.ttf");
const FONT_BOLD_PATH = join(FONT_DIRECTORY, "LiberationSerif-Bold.ttf");
const PAGE_LEFT = 56;
const PAGE_RIGHT = 539;
const CONTENT_WIDTH = PAGE_RIGHT - PAGE_LEFT;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

function safeText(value: string | null | undefined) {
  return (value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function drawIdentityRow(document: PDFKit.PDFDocument, label: string, value: string) {
  const rowY = document.y;
  const labelX = 84;
  const valueX = 226;
  const valueWidth = PAGE_RIGHT - valueX;
  const valueText = `: ${value}`;
  const valueHeight = document.font(PDF_FONT_REGULAR).fontSize(12).heightOfString(valueText, { width: valueWidth, lineGap: 2 });
  document.font(PDF_FONT_BOLD).fontSize(12).text(label, labelX, rowY, { width: 132, lineGap: 2 });
  document.font(PDF_FONT_REGULAR).fontSize(12).text(valueText, valueX, rowY, { width: valueWidth, lineGap: 2 });
  document.y = rowY + Math.max(valueHeight, 16) + 6;
}

export async function createAcceptancePdf(input: AcceptanceLetterPdfInput): Promise<Uint8Array> {
  const assets = await prepareLetterheadAssets(input);
  const document = new PDFDocument({
    size: "A4",
    margin: PAGE_LEFT,
    compress: false,
    info: { Title: "Surat Keterangan Diterima" },
  });
  document.registerFont(PDF_FONT_REGULAR, readFileSync(FONT_REGULAR_PATH));
  document.registerFont(PDF_FONT_BOLD, readFileSync(FONT_BOLD_PATH));

  const chunks: Buffer[] = [];
  const completed = new Promise<Uint8Array>((resolve, reject) => {
    document.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    document.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks))));
    document.on("error", reject);
  });

  const { dividerY } = drawInstitutionalLetterhead(document, input, assets, {
    left: PAGE_LEFT,
    right: PAGE_RIGHT,
    top: 42,
  });

  document.fillColor("#111827");
  document.y = dividerY + 22;
  document.font(PDF_FONT_REGULAR).fontSize(10).text(formatDate(input.issuedAt), PAGE_LEFT, document.y, {
    width: CONTENT_WIDTH,
    align: "right",
  });
  document.moveDown(1.2);
  document.font(PDF_FONT_BOLD).fontSize(14).text("SURAT KETERANGAN DITERIMA", {
    width: CONTENT_WIDTH,
    align: "center",
    underline: true,
  });
  document.moveDown(0.35);
  document.font(PDF_FONT_REGULAR).fontSize(10).text(`Nomor Registrasi: ${safeText(input.registrationNumber)}`, {
    width: CONTENT_WIDTH,
    align: "center",
  });
  document.moveDown(0.2);
  document.font(PDF_FONT_REGULAR).fontSize(10).text("Perihal: Pemberitahuan Hasil Seleksi SPMB", {
    width: CONTENT_WIDTH,
    align: "center",
  });
  document.moveDown(1.6);

  document.font(PDF_FONT_REGULAR).fontSize(12).text("Dengan hormat,");
  document.moveDown(0.75);
  document.font(PDF_FONT_REGULAR).fontSize(12).text(
    "Berdasarkan hasil seluruh tahapan Seleksi Penerimaan Murid Baru (SPMB), dengan ini kami memberitahukan bahwa calon murid berikut telah dinyatakan diterima.",
    { width: CONTENT_WIDTH, align: "justify", indent: 28, lineGap: 4.2 },
  );
  document.moveDown(0.7);
  document.font(PDF_FONT_REGULAR).fontSize(12).text(
    "Adapun data calon murid yang dinyatakan diterima adalah sebagai berikut:",
    { width: CONTENT_WIDTH, align: "justify", indent: 28, lineGap: 4.2 },
  );
  document.moveDown(0.85);

  drawIdentityRow(document, "Nama Calon Murid", safeText(input.studentName) || "-");
  drawIdentityRow(document, "Nomor Pendaftaran", safeText(input.registrationNumber) || "-");
  drawIdentityRow(document, "Tahun Ajaran", safeText(input.academicYearLabel) || "-");

  document.moveDown(0.35);
  document.font(PDF_FONT_BOLD).fontSize(12).text("Keterangan:");
  document.moveDown(0.3);
  document.font(PDF_FONT_REGULAR).fontSize(12).text(
    safeText(input.decisionNote) || "Dinyatakan diterima pada Seleksi Penerimaan Murid Baru.",
    { width: CONTENT_WIDTH, align: "justify", lineGap: 4.2 },
  );
  document.moveDown(1);
  document.font(PDF_FONT_REGULAR).fontSize(12).text(
    "Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.",
    { width: CONTENT_WIDTH, align: "justify", indent: 28, lineGap: 4.2 },
  );
  document.moveDown(2);
  document.font(PDF_FONT_REGULAR).fontSize(12).text(`${getLetterheadIssuerName(input)}, ${formatDate(input.issuedAt)}`, {
    width: CONTENT_WIDTH,
    align: "right",
  });

  document.end();
  return completed;
}
