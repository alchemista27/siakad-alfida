"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, EmptyState } from "@alfida/ui";
import type { OrganizationEmployee } from "../organization/types";
import { fingerprintResponseMessage, readFingerprintJson } from "./fingerprint-response";

type FingerprintSyncRun = {
  status?: string;
  startedAt?: string;
  completedAt?: string | null;
  fetchedCount?: number;
  insertedCount?: number;
  matchedCount?: number;
  unmatchedCount?: number;
  attendanceChanged?: number;
  skippedConflict?: number;
  errorMessage?: string | null;
} | null;

type SyncStatus = {
  lastRun: FingerprintSyncRun;
  readiness: { enabled: boolean; missingConfigurationKeys: string[] };
};

type Unmatched = { enrollmentId: string; localDate: string };
type Notice = { type: "success" | "error"; text: string } | null;

export function AttendanceDataSourcePanel({
  employees,
  canOperateFingerprint,
  canMapFingerprint,
  gpsActive,
  onFingerprintSynced,
}: {
  employees: OrganizationEmployee[];
  canOperateFingerprint: boolean;
  canMapFingerprint: boolean;
  gpsActive: boolean;
  onFingerprintSynced?: () => Promise<void> | void;
}) {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [unmatched, setUnmatched] = useState<Unmatched[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [mapping, setMapping] = useState({ userId: "", enrollmentId: "" });
  const [savingMapping, setSavingMapping] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const refresh = async () => {
    if (!canOperateFingerprint) return;
    setLoading(true);
    try {
      const [statusResponse, unmatchedResponse] = await Promise.all([
        fetch("/api/attendance/fingerprint/status"),
        fetch("/api/attendance/fingerprint/unmatched"),
      ]);
      if (!statusResponse.ok) throw new Error(await fingerprintResponseMessage(statusResponse, "Status sumber fingerprint gagal dimuat."));
      if (!unmatchedResponse.ok) throw new Error(await fingerprintResponseMessage(unmatchedResponse, "Daftar enroll belum terpetakan gagal dimuat."));
      setStatus(await readFingerprintJson<SyncStatus>(statusResponse, "Status sumber fingerprint tidak dapat dibaca."));
      setUnmatched(await readFingerprintJson<Unmatched[]>(unmatchedResponse, "Daftar enroll belum terpetakan tidak dapat dibaca."));
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Status sumber fingerprint gagal dimuat." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, [canOperateFingerprint]);

  const sync = async (range?: { startDate: string; endDate: string }) => {
    setSyncing(true);
    setNotice(null);
    try {
      const response = await fetch("/api/attendance/fingerprint/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(range ?? {}),
      });
      if (!response.ok) throw new Error(await fingerprintResponseMessage(response, "Sinkronisasi fingerprint gagal dijalankan."));
      const result = await readFingerprintJson<{ insertedCount: number; unmatchedCount: number; skippedConflict: number }>(response, "Hasil sinkronisasi fingerprint tidak dapat dibaca.");
      setNotice({ type: "success", text: `Sinkronisasi selesai: ${result.insertedCount} event baru, ${result.unmatchedCount} belum dipetakan, ${result.skippedConflict} konflik presensi dilindungi.` });
      await refresh();
      await onFingerprintSynced?.();
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Sinkronisasi fingerprint gagal dijalankan." });
    } finally {
      setSyncing(false);
    }
  };

  const saveMapping = async (event: FormEvent) => {
    event.preventDefault();
    if (!mapping.userId || !mapping.enrollmentId.trim()) return;
    setSavingMapping(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/attendance/fingerprint/mappings/${encodeURIComponent(mapping.userId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprintEnrollmentId: mapping.enrollmentId.trim() }),
      });
      if (!response.ok) throw new Error(await fingerprintResponseMessage(response, "Mapping enroll fingerprint gagal disimpan."));
      setMapping({ userId: "", enrollmentId: "" });
      setNotice({ type: "success", text: "Mapping nomor enroll fingerprint berhasil disimpan." });
      await refresh();
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Mapping enroll fingerprint gagal disimpan." });
    } finally {
      setSavingMapping(false);
    }
  };

  const lastRun = status?.lastRun ?? null;
  const fingerprintReady = Boolean(status?.readiness.enabled && status.readiness.missingConfigurationKeys.length === 0);
  const missingConfigurationKeys = status?.readiness.missingConfigurationKeys ?? [];
  const count = (key: keyof NonNullable<FingerprintSyncRun>) => Number(lastRun?.[key] ?? 0);
  const fieldClass = "mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-primary";

  return (
    <section className="space-y-4 border-t border-border pt-5" aria-label="Status sumber data kehadiran">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">Provenance & operasional</p>
        <h3 className="mt-1 font-heading text-xl font-bold text-primary">Status Sumber Data</h3>
        <p className="mt-1 text-sm text-slate-600">Fingerprint dan GPS adalah sumber laporan kehadiran. GPS aktif setelah lokasi dan radius unit dikonfigurasi.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-border bg-surface p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fingerprint</p><p className={`mt-1 font-semibold ${fingerprintReady ? "text-tertiary" : "text-amber-800"}`}>{loading ? "Memeriksa readiness" : fingerprintReady ? "Siap disinkronkan" : "Belum siap di server"}</p><p className="mt-1 text-xs text-slate-600">Sinkronisasi hanya membaca log alat dan tidak menimpa GPS/backfill.</p></Card>
        <Card className="border-border bg-surface p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">GPS</p><p className={`mt-1 font-semibold ${gpsActive ? "text-tertiary" : "text-amber-800"}`}>{gpsActive ? "GPS — aktif" : "GPS — belum diaktifkan"}</p><p className="mt-1 text-xs text-slate-600">{gpsActive ? "Presensi lokasi perangkat divalidasi terhadap radius unit." : "Aktivasi runtime belum menerima presensi GPS baru."}</p></Card>
        <Card className="border-border bg-surface p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Backfill</p><p className="mt-1 font-semibold text-primary">Administratif</p><p className="mt-1 text-xs text-slate-600">Riwayat koreksi/dummy selalu diberi provenance backfill.</p></Card>
      </div>

      {notice && <div className={`flex items-center justify-between rounded-sm border p-3 text-sm ${notice.type === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`} role={notice.type === "error" ? "alert" : "status"}><span>{notice.text}</span><button type="button" className="font-semibold" onClick={() => setNotice(null)}>Tutup</button></div>}

      {canOperateFingerprint && status && !fingerprintReady && <Card className="border-amber-200 bg-[#fffaf0] p-4"><h4 className="font-heading text-lg font-bold text-primary">Fingerprint belum siap</h4><p className="mt-1 text-sm text-slate-700">Sinkronisasi dinonaktifkan sampai konfigurasi runtime production dilengkapi. Tidak ada nilai rahasia yang ditampilkan di halaman ini.</p>{!status.readiness.enabled && <p className="mt-2 text-sm font-semibold text-amber-900">`SIMPEG_FINGERPRINT_ENABLED` harus bernilai `true`.</p>}{missingConfigurationKeys.length > 0 && <p className="mt-2 text-xs text-slate-700">Key belum tersedia: {missingConfigurationKeys.join(", ")}</p>}</Card>}

      {canOperateFingerprint && <Card className="border-border bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><h4 className="font-heading text-lg font-bold text-primary">Operasional Fingerprint</h4><p className="mt-1 text-sm text-slate-600">Hanya admin kepegawaian dan super admin dapat membaca status perangkat serta menjalankan sinkronisasi.</p></div>
          <div className="flex flex-wrap gap-2"><Button type="button" variant="secondary" size="sm" onClick={() => void refresh()} disabled={loading || syncing}>Segarkan status</Button><Button type="button" variant="primary" size="sm" onClick={() => void sync()} disabled={loading || syncing || !fingerprintReady}>{syncing ? "Menyinkronkan..." : "Sinkronkan hari ini"}</Button><Button type="button" variant="secondary" size="sm" onClick={() => void sync({ startDate: "2026-10-01", endDate: "2026-10-31" })} disabled={loading || syncing || !fingerprintReady}>Import histori Oktober 2026</Button></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{[["Event dibaca", count("fetchedCount")], ["Event baru", count("insertedCount")], ["Terpetakan", count("matchedCount")], ["Belum dipetakan", count("unmatchedCount")]].map(([label, value]) => <Card key={String(label)} className="border-border bg-neutral p-3"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-tertiary">{value}</p></Card>)}</div>
        {loading ? <p className="mt-4 text-sm text-slate-600">Memuat status sumber fingerprint…</p> : lastRun ? <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div><dt className="text-slate-500">Status proses</dt><dd className="font-semibold text-primary">{lastRun.status || "-"}</dd></div><div><dt className="text-slate-500">Waktu mulai</dt><dd className="text-primary">{lastRun.startedAt ? new Date(lastRun.startedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : "-"}</dd></div><div><dt className="text-slate-500">Presensi diperbarui</dt><dd className="text-primary">{count("attendanceChanged")}</dd></div><div><dt className="text-slate-500">Konflik terlindungi</dt><dd className="text-primary">{count("skippedConflict")}</dd></div>{lastRun.errorMessage && <div className="sm:col-span-2"><dt className="text-slate-500">Pesan proses terakhir</dt><dd className="text-rose-800">{lastRun.errorMessage}</dd></div>}</dl> : <p className="mt-4 text-sm text-slate-600">Belum ada sinkronisasi fingerprint.</p>}
      </Card>}

      {canMapFingerprint && <Card className="border-border bg-surface p-5"><h4 className="font-heading text-lg font-bold text-primary">Mapping Nomor Enroll</h4><p className="mt-1 text-sm text-slate-600">Hubungkan nomor enroll alat ke pegawai secara eksplisit; sistem tidak mencocokkan nama otomatis.</p><form className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto] md:items-end" onSubmit={saveMapping}><label className="block text-xs font-semibold text-primary">Pegawai<select required className={fieldClass} value={mapping.userId} onChange={(event) => setMapping({ ...mapping, userId: event.target.value })}><option value="">Pilih pegawai</option>{employees.filter((employee) => employee.isActive !== false).map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}</select></label><label className="block text-xs font-semibold text-primary">Nomor enroll<input required maxLength={50} className={fieldClass} value={mapping.enrollmentId} onChange={(event) => setMapping({ ...mapping, enrollmentId: event.target.value })} placeholder="Contoh: 0012" /></label><Button type="submit" size="sm" variant="primary" disabled={savingMapping}>{savingMapping ? "Menyimpan..." : "Simpan mapping"}</Button></form></Card>}

      {canOperateFingerprint && <Card className="border-border bg-surface p-5"><h4 className="font-heading text-lg font-bold text-primary">Enroll Belum Terpetakan</h4>{loading ? <p className="mt-3 text-sm text-slate-600">Memuat…</p> : unmatched.length === 0 ? <EmptyState title="Tidak ada enroll tertunda" description="Semua event yang dibaca sudah memiliki mapping atau belum ada event." /> : <ul className="mt-3 divide-y divide-border">{unmatched.map((item) => <li key={`${item.enrollmentId}:${item.localDate}`} className="flex items-center justify-between py-3 text-sm"><span className="font-mono text-primary">{item.enrollmentId}</span><span className="text-slate-500">{item.localDate.slice(0, 10)}</span></li>)}</ul>}</Card>}
    </section>
  );
}
