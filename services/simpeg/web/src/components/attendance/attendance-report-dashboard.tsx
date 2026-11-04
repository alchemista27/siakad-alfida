"use client";

import type { CSSProperties } from "react";
import { Button, Card, EmptyState } from "@alfida/ui";

export type AttendanceSourceFilter = "all" | "fingerprint" | "gps" | "backfill";

type AttendanceSourceSummary = {
  status: "active" | "unavailable" | "administrative";
  attendanceRecords: number;
};

export type AttendanceDashboardReport = {
  month: string;
  scope: { kind: "foundation"; unitIds?: never } | { kind: "unit"; unitIds: string[] };
  sourceFilter: AttendanceSourceFilter;
  sources: {
    fingerprint: AttendanceSourceSummary;
    gps: AttendanceSourceSummary;
    backfill: AttendanceSourceSummary;
  };
  today: { date: string; present: number; late: number; izin: number; cuti: number };
  monthly: { present: number; late: number; izin: number; cuti: number; sakit: number };
  topOnTime: Array<{ userId: string; fullName: string; present: number; late: number }>;
};

type ReportUnit = { id: string; name: string; isActive?: boolean };
type ReportSegment = { key: string; label: string; value: number; color: string };

function monthLabel(value: string): string {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Jakarta" })
    .format(new Date(Date.UTC(year, month - 1, 1)));
}

function todayLabel(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })
    .format(new Date(`${value}T00:00:00.000Z`));
}

function pieStyle(segments: ReportSegment[]): CSSProperties {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (!total) return { background: "conic-gradient(#E3E8E7 0deg 360deg)" };

  let cursor = 0;
  const stops = segments.map((segment) => {
    const next = cursor + (segment.value / total) * 360;
    const stop = `${segment.color} ${cursor.toFixed(2)}deg ${next.toFixed(2)}deg`;
    cursor = next;
    return stop;
  });
  return { background: `conic-gradient(${stops.join(", ")})` };
}

export function AttendanceReportDashboard({
  report,
  units,
  selectedMonth,
  selectedUnitId,
  selectedSource,
  canManageAllUnits,
  loading,
  onMonthChange,
  onUnitChange,
  onSourceChange,
  onRefresh,
}: {
  report: AttendanceDashboardReport | null;
  units: ReportUnit[];
  selectedMonth: string;
  selectedUnitId: string;
  selectedSource: AttendanceSourceFilter;
  canManageAllUnits: boolean;
  loading: boolean;
  onMonthChange: (month: string) => void;
  onUnitChange: (unitId: string) => void;
  onSourceChange: (source: AttendanceSourceFilter) => void;
  onRefresh: () => void;
}) {
  const segments: ReportSegment[] = report ? [
    { key: "present", label: "Hadir tepat waktu", value: report.monthly.present, color: "#0f7f6d" },
    { key: "late", label: "Terlambat", value: report.monthly.late, color: "#d97706" },
    { key: "izin", label: "Izin", value: report.monthly.izin, color: "#2563eb" },
    { key: "cuti", label: "Cuti", value: report.monthly.cuti, color: "#7c3aed" },
    { key: "sakit", label: "Sakit", value: report.monthly.sakit, color: "#dc2626" },
  ] : [];
  const monthlyTotal = segments.reduce((sum, segment) => sum + segment.value, 0);
  const activeUnits = units.filter((unit) => unit.isActive !== false);

  return (
    <section className="space-y-5" aria-label="Laporan kehadiran">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">Laporan operasional</p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-primary">Dashboard Kehadiran</h2>
          <p className="mt-1 text-sm text-slate-600">Rekap kehadiran, izin, dan cuti sesuai cakupan akses Anda.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end">
          <label className="text-xs font-semibold text-primary">
            Bulan laporan
            <input type="month" value={selectedMonth} onChange={(event) => onMonthChange(event.target.value)} className="mt-1 block w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm font-normal text-primary sm:w-auto" aria-label="Bulan laporan" />
          </label>
          <label className="text-xs font-semibold text-primary">
            Cakupan laporan
            <select value={selectedUnitId} onChange={(event) => onUnitChange(event.target.value)} className="mt-1 block w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm font-normal text-primary sm:w-56" aria-label="Cakupan laporan">
              {canManageAllUnits && <option value="">Keseluruhan Yayasan</option>}
              {!canManageAllUnits && <option value="">Semua unit yang dikelola</option>}
              {activeUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-primary">
            Sumber data
            <select value={selectedSource} onChange={(event) => onSourceChange(event.target.value as AttendanceSourceFilter)} className="mt-1 block w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm font-normal text-primary sm:w-52" aria-label="Sumber data">
              <option value="all">Semua sumber</option>
              <option value="fingerprint">Fingerprint — aktif</option>
              <option value="gps">GPS — riwayat, belum tersedia</option>
              <option value="backfill">Backfill administratif</option>
            </select>
          </label>
          <Button type="button" variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>Segarkan</Button>
        </div>
      </div>

      {loading ? (
        <Card className="border-border bg-surface p-6 text-sm text-slate-600">Memuat laporan kehadiran…</Card>
      ) : !report ? (
        <EmptyState title="Laporan belum tersedia" description="Pilih periode lalu segarkan laporan kehadiran." />
      ) : (
        <>
          <Card className="border-border bg-surface p-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div><h3 className="font-heading text-lg font-bold text-primary">Sumber Data Kehadiran</h3><p className="mt-1 text-sm text-slate-600">Fingerprint adalah sumber aktif. Filter sumber hanya memengaruhi data hadir/terlambat; izin, cuti, dan sakit berasal dari pengajuan yang disetujui.</p></div>
              <span className="rounded-sm border border-border bg-neutral px-2.5 py-1 text-xs font-semibold text-slate-600">{selectedSource === "all" ? "Semua sumber" : selectedSource}</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-sm border border-border bg-neutral p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fingerprint</p><p className="mt-1 font-semibold text-tertiary">Aktif</p><p className="mt-2 text-2xl font-bold text-primary">{report.sources.fingerprint.attendanceRecords}</p><p className="text-xs text-slate-500">record pada periode ini</p></div>
              <div className="rounded-sm border border-border bg-neutral p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">GPS</p><p className="mt-1 font-semibold text-amber-800">GPS — belum tersedia</p><p className="mt-2 text-2xl font-bold text-primary">{report.sources.gps.attendanceRecords}</p><p className="text-xs text-slate-500">riwayat GPS, tidak menerima presensi baru</p></div>
              <div className="rounded-sm border border-border bg-neutral p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Backfill</p><p className="mt-1 font-semibold text-primary">Backfill administratif</p><p className="mt-2 text-2xl font-bold text-primary">{report.sources.backfill.attendanceRecords}</p><p className="text-xs text-slate-500">koreksi/riwayat transparan</p></div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Hari ini hadir", value: report.today.present, icon: "check_circle", className: "text-tertiary" },
              { label: "Terlambat", value: report.today.late, icon: "schedule", className: "text-amber-700" },
              { label: "Izin", value: report.today.izin, icon: "assignment_turned_in", className: "text-blue-700" },
              { label: "Cuti", value: report.today.cuti, icon: "event_busy", className: "text-violet-700" },
            ].map((metric) => (
              <Card key={metric.label} className="border-border bg-surface p-4"><span className={`material-symbols-rounded text-xl ${metric.className}`} aria-hidden="true">{metric.icon}</span><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p><p className="mt-1 text-3xl font-bold text-primary">{metric.value}</p><p className="mt-1 text-xs text-slate-500">{todayLabel(report.today.date)}</p></Card>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
            <Card className="border-border bg-surface p-5">
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start"><div><h3 className="font-heading text-lg font-bold text-primary">Komposisi Kehadiran Bulanan</h3><p className="mt-1 text-sm text-slate-600">{monthLabel(report.month)} · {monthlyTotal} catatan hari kerja</p></div><span className="rounded-sm bg-neutral px-3 py-1 text-xs font-semibold text-slate-600">{report.scope.kind === "foundation" ? "Keseluruhan yayasan" : "Unit terpilih"}</span></div>
              <div className="mt-6 grid gap-6 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center">
                <div className="relative mx-auto h-48 w-48 rounded-full" style={pieStyle(segments)} role="img" aria-label={`Pie chart kehadiran ${monthLabel(report.month)}`}><div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-surface text-center"><span className="text-3xl font-bold text-primary">{monthlyTotal}</span><span className="text-xs text-slate-500">total catatan</span></div></div>
                <ul className="space-y-3" aria-label="Legenda pie chart kehadiran">{segments.map((segment) => <li key={segment.key} className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0"><span className="flex items-center gap-2 text-sm text-slate-700"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />{segment.label}</span><span className="text-sm font-semibold text-primary">{segment.value}</span></li>)}</ul>
              </div>
            </Card>

            <Card className="border-border bg-surface p-5"><div><h3 className="font-heading text-lg font-bold text-primary">Top 10 Karyawan Tepat Waktu</h3><p className="mt-1 text-sm text-slate-600">Diurutkan dari jumlah hadir tepat waktu terbanyak, lalu keterlambatan paling sedikit.</p></div>{report.topOnTime.length === 0 ? <p className="mt-6 rounded-sm border border-dashed border-border bg-neutral p-4 text-sm text-slate-600">Belum ada presensi tepat waktu pada periode ini.</p> : <ol className="mt-4 divide-y divide-border">{report.topOnTime.map((employee, index) => <li key={employee.userId} className="flex items-center gap-3 py-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e6f4f1] text-xs font-bold text-tertiary">{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold text-primary">{employee.fullName}</span><span className="text-right text-xs text-slate-500"><strong className="block text-sm text-tertiary">{employee.present} hadir</strong>{employee.late} telat</span></li>)}</ol>}</Card>
          </div>
        </>
      )}
    </section>
  );
}
