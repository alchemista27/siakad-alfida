import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export type MedicalReferralPdfInput = {
  referralNumber: string;
  verificationUrl: string;
  issuedAt: string;
  registrationNumber: string;
  unitName: string;
  academicYearLabel: string;
  studentName: string;
  gender: "male" | "female";
  birthPlace: string;
  birthDate: string;
  unitAddress: string | null;
  unitPhone: string | null;
  unitEmail: string | null;
  unitLogoUrl: string | null;
  foundationName: string;
  foundationLogoUrl: string | null;
};

function cloudinaryPng(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "res.cloudinary.com" && parsed.pathname.includes("/image/upload/")) {
      parsed.pathname = parsed.pathname.replace("/image/upload/", "/image/upload/f_png/");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);
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

function startsWithBytes(bytes: Uint8Array, signature: Uint8Array) {
  return bytes.length >= signature.length && signature.every((value, index) => bytes[index] === value);
}

export function isSupportedPdfRaster(bytes: Uint8Array) {
  return startsWithBytes(bytes, PNG_SIGNATURE) || startsWithBytes(bytes, JPEG_SIGNATURE);
}

async function imageBytes(url: string) {
  const response = await fetch(cloudinaryPng(url), { signal: AbortSignal.timeout(5000), cache: "no-store" });
  if (!response.ok) {
    throw new Error("Aset gambar kop surat tidak dapat digunakan.");
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (!isSupportedPdfRaster(bytes)) {
    throw new Error("Aset gambar kop surat bukan PNG atau JPEG yang didukung.");
  }
  return bytes;
}

async function optionalImageBytes(url: string | null) {
  if (!url?.trim()) return null;
  try {
    return await imageBytes(url);
  } catch {
    return null;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export async function createMedicalReferralPdf(input: MedicalReferralPdfInput): Promise<Uint8Array> {
  const [unitLogo, foundationLogo, qrCode] = await Promise.all([
    optionalImageBytes(input.unitLogoUrl),
    optionalImageBytes(input.foundationLogoUrl),
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

  if (unitLogo) document.image(unitLogo, 56, 42, { fit: [64, 64], valign: "center" });
  if (foundationLogo) document.image(foundationLogo, 475, 42, { fit: [64, 64], align: "right", valign: "center" });
  const headerLeft = unitLogo ? 130 : 56;
  const headerWidth = (foundationLogo ? 465 : 539) - headerLeft;
  const unitDetails = [input.unitAddress, input.unitPhone, input.unitEmail].filter((value): value is string => Boolean(value?.trim())).join(" • ");
  document.font(PDF_FONT_BOLD).fontSize(14).text(input.unitName, headerLeft, 46, { width: headerWidth, align: "center" });
  document.font(PDF_FONT_REGULAR).fontSize(9).text(input.foundationName, headerLeft, 66, { width: headerWidth, align: "center" });
  if (unitDetails) document.font(PDF_FONT_REGULAR).fontSize(7.5).text(unitDetails, headerLeft, 84, { width: headerWidth, align: "center" });
  const dividerY = unitDetails ? 116 : 106;
  document.moveTo(56, dividerY).lineTo(539, dividerY).lineWidth(1.2).strokeColor("#454545").stroke();
  document.y = dividerY;

  document.moveDown(2.2).font(PDF_FONT_BOLD).fontSize(14).text("SURAT PENGANTAR PEMERIKSAAN KESEHATAN", { align: "center" });
  document.moveDown(0.4).font(PDF_FONT_REGULAR).fontSize(10).text(`Nomor: ${input.referralNumber}`, { align: "center" });
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
    ["Nama calon murid", input.studentName],
    ["Tempat, tanggal lahir", `${input.birthPlace}, ${formatDate(input.birthDate)}`],
    ["Jenis kelamin", input.gender === "male" ? "Laki-laki" : "Perempuan"],
    ["Nomor pendaftaran", input.registrationNumber],
    ["Tahun ajaran", input.academicYearLabel],
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
  document.font(PDF_FONT_REGULAR).fontSize(10).text(`${input.unitName}, ${formatDate(input.issuedAt)}`, 315, verificationTop, { width: 224, align: "center" });
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
