"use client";

import { useEffect, useState } from "react";
import { Button, Card, EmptyState } from "@alfida/ui";
import type { OrganizationEmployee } from "../organization/types";

type SyncStatus = {
  id?: string;
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

type Unmatched = { enrollmentId: string; localDate: string };

async function responseMessage(response: Response, fallback: string) {
  const body = await response.json().catch(() => null) as { message?: string | string[] } | null;
  return Array.isArray(body?.message) ? body.message.join(" ") : body?.message || fallback;
}

export function FingerprintSyncPanel({ employees, canManageAllUnits }: { employees: OrganizationEmployee[]; canManageAllUnits: boolean }) {
  const [status, setStatus] = useState<SyncStatus>(null);
  const [unmatched, setUnmatched] = useState<Unmatched[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [mapping, setMapping] = useState({ userId: "", enrollmentId: "" });
  const [savingMapping, setSavingMapping] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const statusResponse = await fetch("/api/attendance/fingerprint/status");
      if (!statusResponse.ok) throw new Error(await responseMessage(statusResponse, "Status sinkronisasi fingerprint gagal dimuat."));
      setStatus(await statusResponse.json());
      if (canManageAllUnits) {
        const unmatchedResponse = await fetch("/api/attendance/fingerprint/unmatched");
        if (!unmatchedResponse.ok) throw new Error(await responseMessage(unmatchedResponse, "Daftar enroll belum terpetakan gagal dimuat."));
        setUnmatched(await unmatchedResponse.json());
      } else {
        setUnmatched([]);
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Status fingerprint gagal dimuat." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, [canManageAllUnits]);

  const syncOctober = async () => {
    setSyncing(true); setMessage(null);
    try {
      const response = await fetch("/api/attendance/fingerprint/sync", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: "2026-10-01", endDate: "2026-10-31" }),
      });
      if (!response.ok) throw new Error(await responseMessage(response, "Sinkronisasi fingerprint gagal dijalankan."));
      const result = await response.json() as { insertedCount: number; unmatchedCount: number; skippedConflict: number };
      setMessage({ type: "success", text: `Sinkronisasi Oktober selesai: ${result.insertedCount} event baru, ${result.unmatchedCount} belum dipetakan, ${result.skippedConflict} konflik presensi dilindungi.` });
      await refresh();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Sinkronisasi fingerprint gagal dijalankan." });
    } finally {
      setSyncing(false);
    }
  };

  const saveMapping = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mapping.userId || !mapping.enrollmentId.trim()) return;
    setSavingMapping(true); setMessage(null);
    try {
      const response = await fetch(`/api/attendance/fingerprint/mappings/${encodeURIComponent(mapping.userId)}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fingerprintEnrollmentId: mapping.enrollmentId.trim() }),
      });
      if (!response.ok) throw new Error(await responseMessage(response, "Mapping enroll fingerprint gagal disimpan."));
      setMapping({ userId: "", enrollmentId: "" });
      setMessage({ type: "success", text: "Mapping nomor enroll fingerprint berhasil disimpan." });
      await refresh();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Mapping enroll fingerprint gagal disimpan." });
    } finally {
      setSavingMapping(false);
    }
  };

  const count = (key: keyof NonNullable<SyncStatus>) => Number(status?.[key] ?? 0);
  const fieldClass = "mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-primary";
  return <div className="space-y-5 text-primary">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h2 className="font-heading text-xl font-bold">Sinkronisasi Fingerprint</h2><p className="mt-1 text-sm text-primary/70">Import riwayat kantor untuk 1–31 Oktober 2026, dengan presensi Senin–Jumat WIB.</p></div>
      <div className="flex gap-2"><Button type="button" variant="secondary" size="sm" onClick={() => void refresh()} disabled={loading || syncing}>Segarkan Status</Button><Button type="button" variant="primary" size="sm" onClick={() => void syncOctober()} disabled={loading || syncing}>{syncing ? "Menyinkronkan..." : "Sinkronkan Oktober 2026"}</Button></div>
    </header>
    <p className="rounded-sm border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">Sinkronisasi hanya membaca log dari alat. Hanya event yang terhubung ke akun Auth aktif dan peran staf yang masuk rekap; presensi GPS/manual yang sudah ada tidak ditimpa.</p>
    {message && <div className={`flex items-center justify-between rounded-sm border p-3 text-sm ${message.type === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`} role={message.type === "error" ? "alert" : "status"}><span>{message.text}</span><button type="button" className="font-semibold" onClick={() => setMessage(null)}>Tutup</button></div>}
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[ ["Event dibaca", count("fetchedCount")], ["Event baru", count("insertedCount")], ["Terpetakan", count("matchedCount")], ["Belum dipetakan", count("unmatchedCount")] ].map(([label, value]) => <Card key={String(label)} className="border border-border bg-surface p-4"><p className="text-xs font-semibold uppercase text-primary/60">{label}</p><p className="mt-1 text-2xl font-bold text-tertiary">{value}</p></Card>)}
    </div>
    <Card className="border border-border bg-surface p-5"><h3 className="font-heading text-lg font-bold">Status proses terakhir</h3>{loading ? <p className="mt-3 text-sm">Memuat status...</p> : status ? <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3"><div><dt className="text-primary/60">Status</dt><dd className="font-semibold">{status.status || "-"}</dd></div><div><dt className="text-primary/60">Waktu mulai</dt><dd>{status.startedAt ? new Date(status.startedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : "-"}</dd></div><div><dt className="text-primary/60">Konflik terlindungi</dt><dd>{count("skippedConflict")}</dd></div><div><dt className="text-primary/60">Presensi dibuat/diperbarui</dt><dd>{count("attendanceChanged")}</dd></div>{status.errorMessage && <div className="sm:col-span-2"><dt className="text-primary/60">Pesan proses</dt><dd className="text-rose-800">{status.errorMessage}</dd></div>}</dl> : <p className="mt-3 text-sm">Belum ada proses sinkronisasi.</p>}</Card>
    {canManageAllUnits && <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <Card className="border border-border bg-surface p-5"><h3 className="font-heading text-lg font-bold">Mapping Nomor Enroll</h3><p className="mt-1 text-sm text-primary/70">Hubungkan nomor enroll alat ke pegawai secara eksplisit; sistem tidak mencocokkan nama otomatis.</p><form className="mt-4 space-y-3" onSubmit={saveMapping}><label className="block text-xs font-semibold">Pegawai<select required className={fieldClass} value={mapping.userId} onChange={(event) => setMapping({ ...mapping, userId: event.target.value })}><option value="">Pilih pegawai</option>{employees.filter((employee) => employee.isActive !== false).map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}</select></label><label className="block text-xs font-semibold">Nomor enroll fingerprint<input required maxLength={50} className={fieldClass} value={mapping.enrollmentId} onChange={(event) => setMapping({ ...mapping, enrollmentId: event.target.value })} placeholder="Contoh: 0012" /></label><div className="flex justify-end"><Button type="submit" size="sm" variant="primary" disabled={savingMapping}>{savingMapping ? "Menyimpan..." : "Simpan Mapping"}</Button></div></form></Card>
      <Card className="border border-border bg-surface p-5"><h3 className="font-heading text-lg font-bold">Enroll Belum Terpetakan</h3>{loading ? <p className="mt-3 text-sm">Memuat...</p> : unmatched.length === 0 ? <EmptyState title="Tidak ada enroll tertunda" description="Semua event dalam rentang sinkronisasi sudah memiliki mapping atau belum ada event." /> : <ul className="mt-3 divide-y divide-border">{unmatched.map((item) => <li key={`${item.enrollmentId}:${item.localDate}`} className="flex items-center justify-between py-3 text-sm"><span className="font-mono">{item.enrollmentId}</span><span className="text-primary/60">{item.localDate.slice(0, 10)}</span></li>)}</ul>}</Card>
    </div>}
  </div>;
}
