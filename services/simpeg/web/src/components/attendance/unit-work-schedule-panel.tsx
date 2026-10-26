"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@alfida/ui";

type Schedule = {
  weekday: number;
  isWorkday: boolean;
  startTime: string | null;
  lateGraceMinutes: number | null;
  endTime: string | null;
  overtimeStartTime: string | null;
};
type ScheduleDraft = { weekday: number; isWorkday: boolean; startTime: string; lateGraceMinutes: string; endTime: string; overtimeStartTime: string };
const weekdays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
function draft(row: Schedule | undefined, weekday: number): ScheduleDraft {
  return { weekday, isWorkday: row?.isWorkday ?? false, startTime: row?.startTime ?? "", lateGraceMinutes: row?.lateGraceMinutes == null ? "" : String(row.lateGraceMinutes), endTime: row?.endTime ?? "", overtimeStartTime: row?.overtimeStartTime ?? "" };
}
function validate(row: ScheduleDraft): string | null {
  if (!row.isWorkday) return null;
  if (![row.startTime, row.endTime, row.overtimeStartTime].every((value) => timePattern.test(value))) return "Isi semua jam dengan format HH:mm.";
  if (!/^\d+$/.test(row.lateGraceMinutes) || Number(row.lateGraceMinutes) > 180) return "Toleransi harus 0–180 menit.";
  if (row.startTime >= row.endTime || row.endTime > row.overtimeStartTime) return "Jam masuk harus sebelum pulang; ambang lembur tidak boleh sebelum jam pulang.";
  const [hour, minute] = row.startTime.split(":").map(Number);
  if (hour * 60 + minute + Number(row.lateGraceMinutes) >= 1440) return "Toleransi tidak boleh melewati akhir hari.";
  return null;
}
async function readError(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
  return Array.isArray(payload?.message) ? payload.message.join(" ") : payload?.message || `Gagal menyimpan jadwal (${response.status}).`;
}
export function UnitWorkSchedulePanel({ unitId, unitName }: { unitId: string; unitName: string }) {
  const [rows, setRows] = useState<ScheduleDraft[]>([]);
  const [configured, setConfigured] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setLoadError(null); setRows([]); setFeedback(null);
    async function load() {
      try {
        const response = await fetch(`/api/attendance/work-schedules?unitId=${encodeURIComponent(unitId)}`, { signal: controller.signal });
        if (!response.ok) throw new Error(await readError(response));
        const payload = await response.json();
        if (!Array.isArray(payload)) throw new Error("Format jadwal dari server tidak valid.");
        if (controller.signal.aborted) return;
        const schedules = payload as Schedule[];
        setRows(weekdays.map((_, weekday) => draft(schedules.find((row) => row.weekday === weekday), weekday)));
        setConfigured(new Set(schedules.map((row) => row.weekday)));
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Jadwal gagal dimuat.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [unitId, reload]);

  function update(weekday: number, changes: Partial<ScheduleDraft>) {
    setRows((current) => current.map((row) => row.weekday === weekday ? { ...row, ...changes } : row));
    setFeedback(null);
  }
  async function save(weekday: number) {
    const row = rows.find((item) => item.weekday === weekday);
    if (!row) return;
    const error = validate(row);
    if (error) { setFeedback({ type: "error", text: `${weekdays[weekday]}: ${error}` }); return; }
    setSaving(weekday); setFeedback(null);
    try {
      const response = await fetch(`/api/attendance/work-schedules/${unitId}/${weekday}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row.isWorkday ? { isWorkday: true, startTime: row.startTime, lateGraceMinutes: Number(row.lateGraceMinutes), endTime: row.endTime, overtimeStartTime: row.overtimeStartTime } : { isWorkday: false, startTime: null, lateGraceMinutes: null, endTime: null, overtimeStartTime: null }),
      });
      if (!response.ok) throw new Error(await readError(response));
      setConfigured((current) => new Set(current).add(weekday));
      setFeedback({ type: "success", text: `Jadwal ${weekdays[weekday]} berhasil disimpan.` });
      setReload((current) => current + 1);
    } catch (caught) { setFeedback({ type: "error", text: caught instanceof Error ? caught.message : "Jadwal gagal disimpan." }); }
    finally { setSaving(null); }
  }
  const inputClass = "mt-1 block w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-primary disabled:bg-neutral";
  return <Card className="border border-border bg-surface p-5 text-primary">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-heading text-lg font-bold">Jadwal kerja {unitName}</h3><p className="mt-1 text-sm">Zona Asia/Jakarta (WIB). Atur setiap hari lalu simpan.</p></div><Button type="button" variant="secondary" size="sm" onClick={() => setReload((value) => value + 1)} disabled={loading}>Segarkan jadwal</Button></div>
    {loading ? <p className="mt-4 text-sm" role="status">Memuat jadwal kerja...</p> : loadError ? <p className="mt-4 rounded-sm border border-border bg-neutral p-3 text-sm" role="alert">{loadError} <button type="button" className="font-semibold text-tertiary" onClick={() => setReload((value) => value + 1)}>Coba lagi</button></p> : <>
      {feedback && <p role={feedback.type === "error" ? "alert" : "status"} className="mt-4 rounded-sm border border-border bg-neutral p-3 text-sm">{feedback.text}</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-2">{rows.map((row) => {
        const error = validate(row);
        return <section key={row.weekday} className="rounded-md border border-border bg-neutral p-4" aria-label={`Jadwal ${weekdays[row.weekday]}`}>
          <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={row.isWorkday} onChange={(event) => update(row.weekday, { isWorkday: event.target.checked })} />{weekdays[row.weekday]} · Hari kerja</label>
          {!configured.has(row.weekday) && <p className="mt-2 text-xs text-tertiary">Belum dikonfigurasi—aturan lama berlaku, lembur belum dihitung.</p>}
          {!row.isWorkday ? <p className="mt-2 text-sm">Tidak wajib presensi kecuali piket khusus.</p> : <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold">Jam masuk<input required type="time" value={row.startTime} onChange={(event) => update(row.weekday, { startTime: event.target.value })} className={inputClass} /></label>
            <label className="text-xs font-semibold">Toleransi (menit)<input required type="number" min="0" max="180" value={row.lateGraceMinutes} onChange={(event) => update(row.weekday, { lateGraceMinutes: event.target.value })} className={inputClass} /></label>
            <label className="text-xs font-semibold">Jam pulang<input required type="time" value={row.endTime} onChange={(event) => update(row.weekday, { endTime: event.target.value })} className={inputClass} /></label>
            <label className="text-xs font-semibold">Mulai lembur<input required type="time" value={row.overtimeStartTime} onChange={(event) => update(row.weekday, { overtimeStartTime: event.target.value })} className={inputClass} /></label>
          </div>}
          {error && <p className="mt-2 text-xs text-tertiary" role="alert">{error}</p>}
          <div className="mt-3"><Button type="button" variant="primary" size="sm" disabled={saving !== null || Boolean(error)} onClick={() => void save(row.weekday)}>{saving === row.weekday ? "Menyimpan..." : `Simpan ${weekdays[row.weekday]}`}</Button></div>
        </section>;
      })}</div>
    </>}
  </Card>;
}
