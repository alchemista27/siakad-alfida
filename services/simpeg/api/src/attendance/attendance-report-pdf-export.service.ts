import { Injectable } from "@nestjs/common";
import { AttendanceService, type AttendanceReportSource } from "./attendance.service";
import { FoundationBrandingClient } from "./foundation-branding.client";
import { AttendanceReportPdfService } from "./attendance-report-pdf.service";

function reportFilename(month: string, scope: { kind: "foundation" | "unit"; label: string }): string {
  const scopeName = scope.kind === "foundation"
    ? "yayasan"
    : scope.label
      .toLocaleLowerCase("id")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "unit";
  return `laporan-rekap-kehadiran-${month}-${scopeName}.pdf`;
}

@Injectable()
export class AttendanceReportPdfExportService {
  constructor(
    private readonly attendance: AttendanceService,
    private readonly branding: FoundationBrandingClient,
    private readonly renderer: AttendanceReportPdfService,
  ) {}

  async generate(month: string | undefined, unitId: string | undefined, source: string | undefined, principal: { roles?: unknown }) {
    const report = await this.attendance.getAttendanceReportExport(month, unitId, principal, source as AttendanceReportSource | undefined);
    const branding = await this.branding.getForPdf();
    const buffer = await this.renderer.render({ report, branding, generatedAt: new Date() });
    return { buffer, filename: reportFilename(report.month, report.scope) };
  }
}
