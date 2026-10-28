import PDFDocument from "pdfkit";

export type MedicalReferralPdfInput = {
  referralNumber: string;
  issuedAt: string;
  registrationNumber: string;
  unitName: string;
  academicYearLabel: string;
  studentName: string;
  gender: "male" | "female";
  birthPlace: string;
  birthDate: string;
  unitLogoUrl: string;
  principalName: string;
  principalSignatureUrl: string;
  foundationName: string;
  foundationLogoUrl: string;
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export async function createMedicalReferralPdf(input: MedicalReferralPdfInput): Promise<Uint8Array> {
  const [unitLogo, foundationLogo, signature] = await Promise.all([
    imageBytes(input.unitLogoUrl),
    imageBytes(input.foundationLogoUrl),
    imageBytes(input.principalSignatureUrl),
  ]);
  const document = new PDFDocument({ size: "A4", margin: 56, info: { Title: "Surat Pengantar Pemeriksaan Kesehatan" } });
  const chunks: Buffer[] = [];
  const completed = new Promise<Uint8Array>((resolve, reject) => {
    document.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    document.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks))));
    document.on("error", reject);
  });

  document.image(unitLogo, 56, 42, { fit: [64, 64], valign: "center" });
  document.image(foundationLogo, 475, 42, { fit: [64, 64], align: "right", valign: "center" });
  document.font("Helvetica-Bold").fontSize(14).text(input.unitName, 130, 46, { width: 335, align: "center" });
  document.font("Helvetica").fontSize(9).text(input.foundationName, 130, 66, { width: 335, align: "center" });
  document.moveTo(56, 116).lineTo(539, 116).lineWidth(1.2).strokeColor("#454545").stroke();

  document.moveDown(3).font("Helvetica-Bold").fontSize(14).text("SURAT PENGANTAR PEMERIKSAAN KESEHATAN", { align: "center" });
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
  document.text(`${input.unitName}, ${formatDate(input.issuedAt)}`, 315, document.y, { width: 224, align: "center" });
  document.font("Helvetica-Bold").text("Kepala Sekolah", 315, document.y + 4, { width: 224, align: "center" });
  document.image(signature, 365, document.y + 10, { fit: [120, 55], align: "center", valign: "center" });
  document.font("Helvetica-Bold").text(input.principalName, 315, document.y + 72, { width: 224, align: "center" });
  document.end();
  return completed;
}
