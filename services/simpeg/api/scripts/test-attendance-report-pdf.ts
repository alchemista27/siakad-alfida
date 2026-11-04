import assert from "node:assert/strict";
import { AttendanceReportPdfService, formatOvertime } from "../src/attendance/attendance-report-pdf.service";

async function main() {
  assert.equal(formatOvertime(0), "0 menit");
  assert.equal(formatOvertime(90), "1 jam 30 menit");
  assert.equal(formatOvertime(120), "2 jam");

  const service = new AttendanceReportPdfService();
  const pdf = await service.render({
    report: {
      month: "2026-10",
      scope: { kind: "unit", unitIds: ["unit-a"], label: "Unit: Unit A" },
      sourceFilter: "all",
      dashboard: {
        month: "2026-10",
        scope: { kind: "unit", unitIds: ["unit-a"] },
        sourceFilter: "all",
        sources: {
          fingerprint: { status: "active", attendanceRecords: 2 },
          gps: { status: "active", attendanceRecords: 1 },
          backfill: { status: "administrative", attendanceRecords: 0 },
        },
        today: { date: "2026-10-02", present: 1, late: 1, izin: 0, cuti: 0 },
        monthly: { present: 1, late: 1, izin: 0, cuti: 0, sakit: 0 },
        topOnTime: [{ userId: "u1", fullName: "Aisyah", present: 1, late: 0 }],
      },
      rows: [{ userId: "u1", fullName: "Aisyah", present: 1, late: 0, izin: 0, cuti: 0, overtimeMinutes: 90, expectedWorkdays: 2, attendancePercentage: 50 }],
    },
    branding: { foundationName: "Yayasan Alfida", logoUrl: null, logo: null },
    generatedAt: new Date("2026-11-04T00:00:00.000Z"),
  });

  assert.ok(pdf.subarray(0, 5).equals(Buffer.from("%PDF-")));
  assert.ok(pdf.length > 1_000);
  console.log("SIMPEG attendance report PDF contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
