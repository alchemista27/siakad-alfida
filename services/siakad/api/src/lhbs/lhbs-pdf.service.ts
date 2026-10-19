import { Injectable } from "@nestjs/common";

type LhbsReportForPdf = {
  semester: number;
  teacherNotes?: string | null;
  summary?: any;
  enrollment?: { student?: { fullName?: string | null }; classroom?: { name?: string | null } | null } | null;
};

function pdfText(value: unknown): string {
  return String(value ?? "-").replace(/[\r\n\t]+/g, " ").trim().slice(0, 120) || "-";
}

function pdfHex(value: string): string {
  return Buffer.from(value, "utf8").toString("hex").toUpperCase();
}

function pdfLine(value: string, size = 10): string {
  return `/${"F1"} ${size} Tf <${pdfHex(value)}> Tj 0 -16 Td`;
}

@Injectable()
export class LhbsPdfService {
  render(report: LhbsReportForPdf): Buffer {
    const summary = report.summary ?? {};
    const attendance = summary.attendance ?? {};
    const subjectGrades = Array.isArray(summary.subjectGrades) ? summary.subjectGrades : [];
    const extracurricularGrades = Array.isArray(summary.extracurricularGrades) ? summary.extracurricularGrades : [];
    const lines = [
      "LAPORAN HASIL BELAJAR SISWA",
      `Siswa: ${pdfText(report.enrollment?.student?.fullName)}`,
      `Kelas: ${pdfText(report.enrollment?.classroom?.name)} | Semester: ${report.semester}`,
      `Kehadiran - Hadir: ${attendance.present ?? 0}; Sakit: ${attendance.sick ?? 0}; Izin: ${attendance.excused ?? 0}; Alpa: ${attendance.absent ?? 0}`,
      "Nilai mata pelajaran:",
      ...subjectGrades.map((grade: any) => `${pdfText(grade.subjectName)} - ${Object.entries(grade.categories ?? {}).map(([category, score]) => `${category}: ${score}`).join(", ") || "belum ada nilai"}`),
      "Nilai ekstrakurikuler:",
      ...(extracurricularGrades.length ? extracurricularGrades.map((grade: any) => `${pdfText(grade.extracurricularName)}: ${pdfText(grade.grade)}`) : ["Belum ada nilai ekstrakurikuler"]),
      `Catatan wali kelas: ${pdfText(report.teacherNotes)}`,
    ];
    const content = ["BT", "/F1 16 Tf", "48 790 Td", `<${pdfHex(lines[0])}> Tj`, "0 -24 Td", ...lines.slice(1).map((line) => pdfLine(line)), "ET"].join("\n");
    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
    ];
    let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const offsets = [0];
    for (let index = 0; index < objects.length; index += 1) {
      offsets.push(Buffer.byteLength(pdf, "binary"));
      pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
    }
    const xrefOffset = Buffer.byteLength(pdf, "binary");
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    return Buffer.from(pdf, "binary");
  }
}
