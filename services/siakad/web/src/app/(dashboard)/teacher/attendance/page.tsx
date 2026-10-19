"use client";

import { FormEvent, useState } from "react";
import { siakadApiFetch } from "@/lib/api";

type AttendanceStatus = "present" | "sick" | "excused" | "absent";
type AttendanceEntry = { id: string; status: AttendanceStatus; notes?: string | null };
type RosterEntry = { enrollment: { id: string; student?: { fullName?: string } | null }; attendance: AttendanceEntry | null };
type AttendanceResponse = { date: string; roster: RosterEntry[] };
type EditableRow = { enrollmentId: string; studentName: string; status: AttendanceStatus; notes: string };

const statuses: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Hadir" },
  { value: "sick", label: "Sakit" },
  { value: "excused", label: "Izin" },
  { value: "absent", label: "Alpa" },
];

export default function TeacherAttendancePage() {
  const [scheduleId, setScheduleId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scheduleId.trim()) {
      setError("ID jadwal wajib diisi.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await siakadApiFetch<AttendanceResponse>(`/attendance/schedules/${scheduleId.trim()}?date=${date}`);
      setRows(data.roster.map((entry) => ({
        enrollmentId: entry.enrollment.id,
        studentName: entry.enrollment.student?.fullName || "Siswa tanpa nama",
        status: entry.attendance?.status || "present",
        notes: entry.attendance?.notes || "",
      })));
      setLoaded(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal memuat presensi.");
      setLoaded(false);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function updateRow(enrollmentId: string, patch: Partial<EditableRow>) {
    setRows((current) => current.map((row) => row.enrollmentId === enrollmentId ? { ...row, ...patch } : row));
  }

  async function saveAttendance() {
    if (!scheduleId.trim() || rows.length === 0) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await siakadApiFetch(`/attendance/schedules/${scheduleId.trim()}/batch`, {
        method: "PUT",
        body: JSON.stringify({ date, items: rows.map(({ enrollmentId, status, notes }) => ({ enrollmentId, status, notes: notes || undefined })) }),
      });
      setSuccess("Presensi berhasil disimpan.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal menyimpan presensi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 p-5 md:p-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0f7f6d]">Ruang guru</p>
        <h1 className="mt-2 text-3xl font-semibold">Presensi kelas</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#454545]/75">Masukkan ID jadwal yang ditugaskan kepada Anda. Server memverifikasi penugasan dan roster sebelum data ditampilkan atau disimpan.</p>
      </header>

      <form onSubmit={loadAttendance} className="grid gap-4 rounded-lg border border-[#E3E8E7] bg-white p-5 md:grid-cols-[1fr_180px_auto] md:items-end">
        <label className="grid gap-2 text-sm font-medium">ID jadwal
          <input value={scheduleId} onChange={(event) => setScheduleId(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" placeholder="UUID jadwal" />
        </label>
        <label className="grid gap-2 text-sm font-medium">Tanggal
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" />
        </label>
        <button type="submit" disabled={loading} className="rounded-sm bg-[#0f7f6d] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Memuat…" : "Muat roster"}</button>
      </form>

      {error && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {success && <p role="status" className="rounded-sm border border-[#b9dfd8] bg-[#e6f4f1] p-3 text-sm text-[#0f7f6d]">{success}</p>}
      {loading && <p className="text-sm text-[#454545]/70">Memuat data presensi…</p>}
      {loaded && !loading && rows.length === 0 && <p className="rounded-lg border border-[#E3E8E7] bg-white p-5 text-sm text-[#454545]/75">Belum ada siswa aktif pada roster jadwal ini.</p>}
      {rows.length > 0 && (
        <section className="overflow-hidden rounded-lg border border-[#E3E8E7] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E3E8E7] p-4">
            <h2 className="text-lg font-semibold">Roster {date}</h2>
            <button type="button" onClick={saveAttendance} disabled={saving} className="rounded-sm bg-[#0f7f6d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Menyimpan…" : "Simpan presensi"}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#F7F8F8] text-xs uppercase tracking-wide text-[#454545]/65"><tr><th className="p-3">Siswa</th><th className="p-3">Status</th><th className="p-3">Catatan</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.enrollmentId} className="border-t border-[#E3E8E7]">
                <td className="p-3 font-medium">{row.studentName}</td>
                <td className="p-3"><select value={row.status} onChange={(event) => updateRow(row.enrollmentId, { status: event.target.value as AttendanceStatus })} className="rounded-sm border border-[#E3E8E7] bg-white px-2 py-1.5">{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></td>
                <td className="p-3"><input value={row.notes} onChange={(event) => updateRow(row.enrollmentId, { notes: event.target.value })} className="w-full rounded-sm border border-[#E3E8E7] px-2 py-1.5" placeholder="Opsional" /></td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
