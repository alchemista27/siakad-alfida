export type AcceptanceLetterPdfInput = {
  registrationNumber: string;
  unitName: string;
  academicYearLabel: string;
  studentName: string;
  decisionNote?: string | null;
};

function plainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\x20-\x7E]/g, "?")
    .trim();
}

function escapePdfText(value: string): string {
  return plainText(value).replace(/([\\()])/g, "\\$1");
}

function wrap(value: string, maxLength = 76): string[] {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : ["-"];
}

function toPdfBytes(document: string): Uint8Array {
  return new TextEncoder().encode(document);
}

export function createAcceptancePdf(input: AcceptanceLetterPdfInput): Uint8Array {
  const rows = [
    "SURAT KETERANGAN KELULUSAN SELEKSI SPMB",
    "",
    `Unit Pendidikan: ${input.unitName}`,
    `Tahun Ajaran: ${input.academicYearLabel}`,
    `Nomor Registrasi: ${input.registrationNumber}`,
    `Nama Calon Santri: ${input.studentName}`,
    "Status Seleksi: DITERIMA",
    "Catatan Panitia:",
    ...(input.decisionNote ? wrap(input.decisionNote) : ["-"]),
  ];

  const streamLines = ["BT", "/F1 14 Tf", "72 760 Td"];
  rows.forEach((row, index) => {
    if (index > 0) streamLines.push("0 -22 Td");
    streamLines.push(`(${escapePdfText(row)}) Tj`);
  });
  streamLines.push("ET");
  const stream = `${streamLines.join("\n")}\n`;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${toPdfBytes(stream).length} >>\nstream\n${stream}endstream`,
  ];

  let pdf = "%PDF-1.4\n%PDF-SIM-ALFIDA\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(toPdfBytes(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = toPdfBytes(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return toPdfBytes(pdf);
}
