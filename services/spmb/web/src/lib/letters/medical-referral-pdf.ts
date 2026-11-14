import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import {
  drawInstitutionalLetterhead,
  getLetterheadIssuerName,
  isSupportedLetterheadRaster,
  prepareLetterheadAssets,
  safeLetterheadText,
  type InstitutionalLetterheadInput,
} from "./letterhead";

export type MedicalReferralPdfInput = InstitutionalLetterheadInput & {
  referralNumber: string;
  verificationUrl: string;
  issuedAt: string;
  registrationNumber: string;
  academicYearLabel: string;
  studentName: string;
  gender: "male" | "female";
  birthPlace: string;
  birthDate: string;
};

const PDF_FONT_REGULAR = "LiberationSerifRegular";
const PDF_FONT_BOLD = "LiberationSerifBold";
const LIBERATION_SERIF_FONT_DIRECTORY = existsSync(join(process.cwd(), "assets/fonts"))
  ? join(process.cwd(), "assets/fonts")
  : join(process.cwd(), "services/spmb/web/assets/fonts");
const LIBERATION_SERIF_REGULAR_PATH = join(
  LIBERATION_SERIF_FONT_DIRECTORY,
  "LiberationSerif-Regular.ttf",
);
const LIBERATION_SERIF_BOLD_PATH = join(
  LIBERATION_SERIF_FONT_DIRECTORY,
  "LiberationSerif-Bold.ttf",
);

export const MEDICAL_REFERRAL_QR_SIZE = 72;
export const MEDICAL_REFERRAL_QR_TOP_OFFSET = 76;
export const MEDICAL_REFERRAL_QR_CAPTION_OFFSET =
  MEDICAL_REFERRAL_QR_TOP_OFFSET + MEDICAL_REFERRAL_QR_SIZE + 8;

export function isSupportedPdfRaster(bytes: Uint8Array) {
  return isSupportedLetterheadRaster(bytes);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export async function createMedicalReferralPdf(input: MedicalReferralPdfInput): Promise<Uint8Array> {
  const [assets, qrCode] = await Promise.all([
    prepareLetterheadAssets(input),
    QRCode.toBuffer(input.verificationUrl, {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 0,
      width: 128,
    }),
  ]);
  const document = new PDFDocument({ size: "A4", margin: 56, info: { Title: "Surat Pengantar Pemeriksaan Kesehatan" } });
  document.registerFont(PDF_FONT_REGULAR, readFileSync(LIBERATION_SERIF_REGULAR_PATH));
  document.registerFont(PDF_FONT_BOLD, readFileSync(LIBERATION_SERIF_BOLD_PATH));
  const chunks: Buffer[] = [];
  const completed = new Promise<Uint8Array>((resolve, reject) => {
    document.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    document.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks))));
    document.on("error", reject);
  });

  const { dividerY } = drawInstitutionalLetterhead(document, input, assets);
  document.y = dividerY;

  document.moveDown(2.2).font(PDF_FONT_BOLD).fontSize(14).text("SURAT PENGANTAR PEMERIKSAAN KESEHATAN", { align: "center" });
  document.moveDown(0.4).font(PDF_FONT_REGULAR).fontSize(10).text(`Nomor: ${safeLetterheadText(input.referralNumber)}`, { align: "center" });
  document.moveDown(2);
  document.font(PDF_FONT_REGULAR).fontSize(11).text("Kepada Yth.");
  document.font(PDF_FONT_BOLD).text("Klinik IMC");
  document.font(PDF_FONT_REGULAR).text("di tempat");
  document.moveDown();
  document.text("Dengan hormat,");
  document.moveDown(0.7);
  document.text("Mohon dilakukan pemeriksaan kesehatan bagi calon murid berikut:");
  document.moveDown(0.7);
  const labelX = 80;
  const valueX = 210;
  const rows: Array<[string, string]> = [
    ["Nama calon murid", safeLetterheadText(input.studentName)],
    ["Tempat, tanggal lahir", `${safeLetterheadText(input.birthPlace)}, ${formatDate(input.birthDate)}`],
    ["Jenis kelamin", input.gender === "male" ? "Laki-laki" : "Perempuan"],
    ["Nomor pendaftaran", safeLetterheadText(input.registrationNumber)],
    ["Tahun ajaran", safeLetterheadText(input.academicYearLabel)],
  ];
  rows.forEach(([label, value]) => {
    const y = document.y;
    document.font(PDF_FONT_BOLD).text(label, labelX, y, { width: 125 });
    document.font(PDF_FONT_REGULAR).text(`: ${value}`, valueX, y, { width: 300 });
    document.moveDown(0.45);
  });
  document.moveDown();
  document.text("Hasil pemeriksaan kesehatan dapat diunggah kembali melalui portal SPMB sebagai kelengkapan verifikasi berkas.", { align: "justify" });
  document.moveDown(1.7);
  const verificationTop = document.y;
  const issuerName = getLetterheadIssuerName(input);
  document.font(PDF_FONT_REGULAR).fontSize(10).text(`${issuerName}, ${formatDate(input.issuedAt)}`, 315, verificationTop, { width: 224, align: "center" });
  document.font(PDF_FONT_BOLD).fontSize(9).text("Verifikasi Keaslian Surat", 315, verificationTop + 20, { width: 224, align: "center" });
  document.image(qrCode, 391, verificationTop + MEDICAL_REFERRAL_QR_TOP_OFFSET, {
    fit: [MEDICAL_REFERRAL_QR_SIZE, MEDICAL_REFERRAL_QR_SIZE],
  });
  document.font(PDF_FONT_REGULAR).fontSize(7).text(
    "Pindai QR untuk memverifikasi peserta SPMB.",
    315,
    verificationTop + MEDICAL_REFERRAL_QR_CAPTION_OFFSET,
    { width: 224, align: "center" },
  );
  document.end();
  return completed;
}
