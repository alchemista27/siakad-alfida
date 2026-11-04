import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { AttendanceReportExport } from "./attendance.service";
import type { FoundationBranding } from "./foundation-branding.client";

const COLORS = {
  primary: "#454545",
  tertiary: "#0f7f6d",
  neutral: "#F7F8F8",
  surface: "#FFFFFF",
  border: "#E3E8E7",
  onTertiary: "#F7F8F8",
} as const;

const PAGE = { width: 841.89, height: 595.28, margin: 28 };
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;
const REGULAR_FONT = resolve(__dirname, "../../assets/fonts/LiberationSerif-Regular.ttf");
const BOLD_FONT = resolve(__dirname, "../../assets/fonts/LiberationSerif-Bold.ttf");

export type AttendancePdfInput = {
  report: AttendanceReportExport;
  branding: FoundationBranding;
  generatedAt: Date;
};

export function formatOvertime(minutes: number): string {
  const safe = Number.isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : 0;
  const hours = Math.floor(safe / 60);
  const remaining = safe % 60;
  if (!hours) return `${remaining} menit`;
  if (!remaining) return `${hours} jam`;
  return `${hours} jam ${remaining} menit`;
}

function monthLabel(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Jakarta" })
    .format(new Date(Date.UTC(year, month - 1, 1)));
}

function sourceLabel(value: AttendanceReportExport["sourceFilter"]): string {
  return ({ all: "Semua sumber", fingerprint: "Fingerprint", gps: "GPS", backfill: "Backfill administratif" } as const)[value];
}

function metricBox(doc: PDFKit.PDFDocument, x: number, y: number, label: string, value: number): void {
  const width = (CONTENT_WIDTH - 24) / 4;
  doc.roundedRect(x, y, width, 62, 3).fillAndStroke(COLORS.neutral, COLORS.border);
  doc.font("LiberationSerif-Bold").fontSize(12).fillColor(COLORS.primary).text(label, x + 9, y + 10, { width: width - 18 });
  doc.font("LiberationSerif-Bold").fontSize(16).fillColor(COLORS.tertiary).text(String(value), x + 9, y + 31, { width: width - 18 });
}

@Injectable()
export class AttendanceReportPdfService {
  async render(input: AttendancePdfInput): Promise<Buffer> {
    if (!existsSync(REGULAR_FONT) || !existsSync(BOLD_FONT)) {
      throw new Error("Font Liberation Serif untuk laporan kehadiran tidak tersedia.");
    }
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: PAGE.margin, bufferPages: true });
    doc.registerFont("LiberationSerif", REGULAR_FONT);
    doc.registerFont("LiberationSerif-Bold", BOLD_FONT);
    const chunks: Buffer[] = [];
    const result = new Promise<Buffer>((resolveResult, reject) => {
      doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      doc.on("end", () => resolveResult(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    this.drawHeader(doc, input, "REKAP DASHBOARD");
    this.drawDashboard(doc, input);
    doc.addPage();
    this.drawHeader(doc, input, "TABEL REKAP PEGAWAI");
    this.drawTable(doc, input);
    this.drawFooters(doc);
    doc.end();
    return result;
  }

  private drawHeader(doc: PDFKit.PDFDocument, input: AttendancePdfInput, section: string): void {
    let textX = PAGE.margin;
    if (input.branding.logo) {
      try {
        doc.image(input.branding.logo, PAGE.margin, PAGE.margin, { fit: [54, 44] });
        textX += 64;
      } catch {
        // Branding must not block a scoped report if an uploaded image is invalid.
      }
    }
    doc.font("LiberationSerif-Bold").fontSize(14).fillColor(COLORS.primary).text(input.branding.foundationName, textX, PAGE.margin, { width: 420 });
    doc.font("LiberationSerif-Bold").fontSize(16).fillColor(COLORS.tertiary).text("LAPORAN REKAP KEHADIRAN", textX, PAGE.margin + 18, { width: 470 });
    doc.font("LiberationSerif").fontSize(12).fillColor(COLORS.primary).text(input.report.scope.label, textX, PAGE.margin + 38, { width: 500 });
    doc.font("LiberationSerif").fontSize(12).fillColor(COLORS.primary).text(`Periode: ${monthLabel(input.report.month)} WIB · Sumber: ${sourceLabel(input.report.sourceFilter)}`, PAGE.margin, 86, { width: CONTENT_WIDTH });
    doc.font("LiberationSerif-Bold").fontSize(12).fillColor(COLORS.tertiary).text(section, PAGE.margin, 108, { width: CONTENT_WIDTH });
    doc.moveTo(PAGE.margin, 126).lineTo(PAGE.width - PAGE.margin, 126).lineWidth(1).strokeColor(COLORS.border).stroke();
  }

  private drawDashboard(doc: PDFKit.PDFDocument, input: AttendancePdfInput): void {
    const { dashboard } = input.report;
    const y = 140;
    metricBox(doc, PAGE.margin, y, "Hadir hari ini", dashboard.today.present);
    metricBox(doc, PAGE.margin + ((CONTENT_WIDTH - 24) / 4 + 8), y, "Terlambat hari ini", dashboard.today.late);
    metricBox(doc, PAGE.margin + (((CONTENT_WIDTH - 24) / 4 + 8) * 2), y, "Izin hari ini", dashboard.today.izin);
    metricBox(doc, PAGE.margin + (((CONTENT_WIDTH - 24) / 4 + 8) * 3), y, "Cuti hari ini", dashboard.today.cuti);

    doc.font("LiberationSerif-Bold").fontSize(12).fillColor(COLORS.primary).text("Komposisi Kehadiran Bulanan", PAGE.margin, 222);
    const composition = [
      ["Hadir tepat waktu", dashboard.monthly.present],
      ["Terlambat", dashboard.monthly.late],
      ["Izin", dashboard.monthly.izin],
      ["Cuti", dashboard.monthly.cuti],
      ["Sakit", dashboard.monthly.sakit],
    ];
    composition.forEach(([label, value], index) => {
      const rowY = 245 + index * 22;
      doc.rect(PAGE.margin, rowY, 10, 10).fill(index === 0 ? COLORS.tertiary : COLORS.border);
      doc.font("LiberationSerif").fontSize(12).fillColor(COLORS.primary).text(String(label), PAGE.margin + 16, rowY - 1, { width: 210 });
      doc.font("LiberationSerif-Bold").fontSize(12).fillColor(COLORS.primary).text(String(value), PAGE.margin + 232, rowY - 1, { width: 50, align: "right" });
    });

    doc.font("LiberationSerif-Bold").fontSize(12).fillColor(COLORS.primary).text("Sumber data periode", 330, 222);
    const sources = [
      ["Fingerprint", dashboard.sources.fingerprint.attendanceRecords],
      ["GPS", dashboard.sources.gps.attendanceRecords],
      ["Backfill", dashboard.sources.backfill.attendanceRecords],
    ];
    sources.forEach(([label, value], index) => {
      const rowY = 245 + index * 24;
      doc.font("LiberationSerif").fontSize(12).fillColor(COLORS.primary).text(String(label), 330, rowY, { width: 145 });
      doc.font("LiberationSerif-Bold").fontSize(12).fillColor(COLORS.tertiary).text(String(value), 475, rowY, { width: 55, align: "right" });
    });

    doc.font("LiberationSerif-Bold").fontSize(12).fillColor(COLORS.primary).text("Top 10 Pegawai Tepat Waktu", 570, 222);
    if (!dashboard.topOnTime.length) {
      doc.font("LiberationSerif").fontSize(12).fillColor(COLORS.primary).text("Belum ada data pada periode ini.", 570, 245, { width: 235 });
    } else {
      dashboard.topOnTime.forEach((employee, index) => {
        const rowY = 245 + index * 22;
        doc.font("LiberationSerif-Bold").fontSize(12).fillColor(COLORS.tertiary).text(`${index + 1}.`, 570, rowY, { width: 20 });
        doc.font("LiberationSerif").fontSize(12).fillColor(COLORS.primary).text(employee.fullName, 592, rowY, { width: 155, ellipsis: true });
        doc.font("LiberationSerif-Bold").fontSize(12).fillColor(COLORS.primary).text(`${employee.present} hadir`, 747, rowY, { width: 62, align: "right" });
      });
    }
  }

  private drawTable(doc: PDFKit.PDFDocument, input: AttendancePdfInput): void {
    const columns = [
      { key: "no", label: "No", width: 28, align: "center" as const },
      { key: "name", label: "Nama Pegawai", width: 210, align: "left" as const },
      { key: "present", label: "Total Hadir\nTepat Waktu", width: 87, align: "center" as const },
      { key: "late", label: "Total Hadir\nTerlambat", width: 80, align: "center" as const },
      { key: "izin", label: "Total\nIzin", width: 54, align: "center" as const },
      { key: "cuti", label: "Total\nCuti", width: 54, align: "center" as const },
      { key: "overtime", label: "Total\nLembur", width: 95, align: "center" as const },
      { key: "percentage", label: "Presentase\nKehadiran", width: 104, align: "center" as const },
    ];
    const drawTableHeader = (y: number) => {
      let x = PAGE.margin;
      doc.font("LiberationSerif-Bold").fontSize(12);
      for (const column of columns) {
        doc.rect(x, y, column.width, 42).fillAndStroke(COLORS.tertiary, COLORS.border);
        doc.fillColor(COLORS.onTertiary).text(column.label, x + 4, y + 7, { width: column.width - 8, align: column.align });
        x += column.width;
      }
    };

    let y = 140;
    drawTableHeader(y);
    y += 42;
    input.report.rows.forEach((row, index) => {
      const nameHeight = doc.font("LiberationSerif").fontSize(12).heightOfString(row.fullName, { width: columns[1].width - 8 });
      const rowHeight = Math.max(30, nameHeight + 12);
      if (y + rowHeight > PAGE.height - PAGE.margin - 20) {
        doc.addPage();
        this.drawHeader(doc, input, "TABEL REKAP PEGAWAI");
        y = 140;
        drawTableHeader(y);
        y += 42;
      }
      const values = [
        String(index + 1), row.fullName, String(row.present), String(row.late), String(row.izin), String(row.cuti),
        formatOvertime(row.overtimeMinutes), `${row.attendancePercentage.toFixed(2).replace(".", ",")}%`,
      ];
      let x = PAGE.margin;
      columns.forEach((column, columnIndex) => {
        doc.rect(x, y, column.width, rowHeight).fillAndStroke(index % 2 ? COLORS.surface : COLORS.neutral, COLORS.border);
        doc.font("LiberationSerif").fontSize(12).fillColor(COLORS.primary).text(values[columnIndex], x + 4, y + 6, {
          width: column.width - 8,
          align: column.align,
          height: rowHeight - 8,
        });
        x += column.width;
      });
      y += rowHeight;
    });
  }

  private drawFooters(doc: PDFKit.PDFDocument): void {
    const range = doc.bufferedPageRange();
    for (let index = 0; index < range.count; index += 1) {
      doc.switchToPage(index);
      doc.font("LiberationSerif").fontSize(12).fillColor(COLORS.primary)
        .text(`Halaman ${index + 1} dari ${range.count}`, PAGE.margin, PAGE.height - 22, { width: CONTENT_WIDTH, align: "right" });
    }
  }
}
