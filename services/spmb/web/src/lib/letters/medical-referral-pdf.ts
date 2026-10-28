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

async function imageBytes(url: string) {
  const response = await fetch(cloudinaryPng(url), { signal: AbortSignal.timeout(5000), cache: "no-store" });
  const contentType = response.headers.get("content-type")?.toLowerCase() || "";
  if (!response.ok || (!contentType.includes("image/png") && !contentType.includes("image/jpeg"))) {
    throw new Error("Aset gambar kop surat tidak dapat digunakan.");
  }
  return Buffer.from(await response.arrayBuffer());
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
  document.font("Helvetica-Bold").fontSize(14).text(input.unitName, headerLeft, 46, { width: headerWidth, align: "center" });
  document.font("Helvetica").fontSize(9).text(input.foundationName, headerLeft, 66, { width: headerWidth, align: "center" });
  if (unitDetails) document.fontSize(7.5).text(unitDetails, headerLeft, 84, { width: headerWidth, align: "center" });
  const dividerY = unitDetails ? 116 : 106;
  document.moveTo(56, dividerY).lineTo(539, dividerY).lineWidth(1.2).strokeColor("#454545").stroke();
  document.y = dividerY;

  document.moveDown(2.2).font("Helvetica-Bold").fontSize(14).text("SURAT PENGANTAR PEMERIKSAAN KESEHATAN", { align: "center" });
  document.moveDown(0.4).font("Helvetica").fontSize(10).text(`Nomor: ${input.referralNumber}`, { align: "center" });
  document.moveDown(2);
  document.fontSize(11).text("Kepada Yth.");
  document.text("Petugas Pemeriksaan Kesehatan");
  document.text("di tempat");
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
    document.font("Helvetica-Bold").text(label, labelX, y, { width: 125 });
    document.font("Helvetica").text(`: ${value}`, valueX, y, { width: 300 });
    document.moveDown(0.45);
  });
  document.moveDown();
  document.text("Hasil pemeriksaan kesehatan dapat diunggah kembali melalui portal SPMB sebagai kelengkapan verifikasi berkas.", { align: "justify" });
  document.moveDown(1.7);
  const verificationTop = document.y;
  document.text(`${input.unitName}, ${formatDate(input.issuedAt)}`, 315, verificationTop, { width: 224, align: "center" });
  document.font("Helvetica-Bold").fontSize(9).text("Verifikasi Keaslian Surat", 315, verificationTop + 18, { width: 224, align: "center" });
  document.image(qrCode, 375, verificationTop + 34, { fit: [104, 104] });
  document.font("Helvetica").fontSize(7).text("Pindai QR untuk memverifikasi peserta SPMB.", 315, verificationTop + 144, { width: 224, align: "center" });
  document.end();
  return completed;
}
