"use client";

import { useState } from "react";
import { Button, Card } from "@alfida/ui";
import type { OrganizationEmployee, OrganizationUnit } from "../organization/types";
import { UnitWorkSchedulePanel } from "./unit-work-schedule-panel";

export type Holiday = {
  id: string;
  unitId: string | null;
  date: string;
  name: string;
  description?: string | null;
  source?: string | null;
  providerSyncedAt?: string | null;
};
export type SaturdayDuty = {
  id: string;
  unitId: string;
  userId: string;
  date: string;
  notes?: string | null;
  startTime?: string | null;
  lateGraceMinutes?: number | null;
  endTime?: string | null;
  overtimeStartTime?: string | null;
};
type DeleteTarget = { kind: "holiday" | "duty"; id: string; label: string } | null;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
function dateValue(value: string) { return value.slice(0, 10); }
function formattedDate(value: string) {
  return new Date(`${dateValue(value)}T00:00:00Z`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
async function errorMessage(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
  if (Array.isArray(payload?.message)) return payload.message.join(" ");
  return typeof payload?.message === "string" ? payload.message : fallback;
}
function dutyTimeError(form: { startTime: string; lateGraceMinutes: string; endTime: string; overtimeStartTime: string }) {
  if (!timePattern.test(form.startTime) || !timePattern.test(form.endTime) || !timePattern.test(form.overtimeStartTime)) return "Jam piket harus berformat HH:mm.";
  const grace = Number(form.lateGraceMinutes);
  if (!/^\d+$/.test(form.lateGraceMinutes) || grace > 180) return "Toleransi harus 0–180 menit.";
  if (form.startTime >= form.endTime || form.endTime > form.overtimeStartTime) return "Jam masuk harus sebelum jam pulang, dan ambang lembur tidak boleh sebelum jam pulang.";
  const [hour, minute] = form.startTime.split(":").map(Number);
  if (hour * 60 + minute + grace >= 1440) return "Toleransi tidak boleh melewati akhir hari.";
  return null;
}
const emptyDuty = (today: string) => ({ id: "", unitId: "", userId: "", date: today, notes: "", startTime: "", lateGraceMinutes: "", endTime: "", overtimeStartTime: "" });

export function WorkdayManagementPanel({ holidays, duties, units, employees, onChanged }: {
  holidays: Holiday[];
  duties: SaturdayDuty[];
  units: OrganizationUnit[];
  employees: OrganizationEmployee[];
  onChanged: () => Promise<void> | void;
}) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [holidayForm, setHolidayForm] = useState({ id: "", unitId: "", date: today, name: "", description: "" });
  const [dutyForm, setDutyForm] = useState(emptyDuty(today));
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [submitting, setSubmitting] = useState<"holiday" | "duty" | "delete" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const activeUnits = units.filter((unit) => unit.isActive);
  const activeEmployees = employees.filter((employee) => employee.isActive !== false);
  const currentUnitId = activeUnits.some((unit) => unit.id === selectedUnitId) ? selectedUnitId : activeUnits[0]?.id || "";
  const resetHoliday = () => setHolidayForm({ id: "", unitId: currentUnitId, date: today, name: "", description: "" });
  const resetDuty = () => setDutyForm(emptyDuty(today));

  const saveHoliday = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!holidayForm.unitId || !activeUnits.some((unit) => unit.id === holidayForm.unitId)) { setMessage({ type: "error", text: "Pilih unit yang dapat Anda kelola." }); return; }
    setSubmitting("holiday"); setMessage(null);
    try {
      const response = await fetch("/api/attendance/holidays", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(holidayForm.id ? { id: holidayForm.id } : {}), unitId: holidayForm.unitId, date: holidayForm.date, name: holidayForm.name, description: holidayForm.description || undefined }),
      });
      if (!response.ok) throw new Error(await errorMessage(response, "Hari libur gagal disimpan."));
      resetHoliday(); setMessage({ type: "success", text: "Hari libur unit berhasil disimpan." }); await onChanged();
    } catch (error) { setMessage({ type: "error", text: error instanceof Error ? error.message : "Hari libur gagal disimpan." }); }
    finally { setSubmitting(null); }
  };
  const saveDuty = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = dutyTimeError(dutyForm);
    if (validation || !activeUnits.some((unit) => unit.id === dutyForm.unitId)) { setMessage({ type: "error", text: validation || "Pilih unit yang dapat Anda kelola." }); return; }
    setSubmitting("duty"); setMessage(null);
    try {
      const response = await fetch("/api/attendance/saturday-duties", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(dutyForm.id ? { id: dutyForm.id } : {}), unitId: dutyForm.unitId, userId: dutyForm.userId, date: dutyForm.date, notes: dutyForm.notes || undefined,
          startTime: dutyForm.startTime, lateGraceMinutes: Number(dutyForm.lateGraceMinutes), endTime: dutyForm.endTime, overtimeStartTime: dutyForm.overtimeStartTime }),
      });
      if (!response.ok) throw new Error(await errorMessage(response, "Piket Sabtu gagal disimpan."));
      resetDuty(); setMessage({ type: "success", text: "Piket Sabtu berhasil disimpan." }); await onChanged();
    } catch (error) { setMessage({ type: "error", text: error instanceof Error ? error.message : "Piket Sabtu gagal disimpan." }); }
    finally { setSubmitting(null); }
  };
  const remove = async () => {
    if (!deleteTarget) return;
    setSubmitting("delete"); setMessage(null);
    try {
      const path = deleteTarget.kind === "holiday" ? `/api/attendance/holidays/${deleteTarget.id}` : `/api/attendance/saturday-duties/${deleteTarget.id}`;
      const response = await fetch(path, { method: "DELETE" });
      if (!response.ok) throw new Error(await errorMessage(response, "Data gagal dihapus."));
      setDeleteTarget(null); setMessage({ type: "success", text: "Data berhasil dihapus." }); await onChanged();
    } catch (error) { setMessage({ type: "error", text: error instanceof Error ? error.message : "Data gagal dihapus." }); }
    finally { setSubmitting(null); }
  };
  const fieldClass = "mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-primary";
  return <div className="space-y-6 text-primary">
    <header><h2 className="font-heading text-xl font-bold">Jadwal Kerja, Hari Libur & Piket Sabtu</h2><p className="mt-1 text-sm">Hari libur nasional muncul otomatis untuk semua unit. Hari libur khusus dan piket hanya dapat diatur pada unit yang Anda kelola.</p></header>
    {message && <div className="flex justify-between rounded-sm border border-border bg-neutral p-3 text-sm" role={message.type === "error" ? "alert" : "status"}><span>{message.text}</span><button type="button" onClick={() => setMessage(null)}>Tutup</button></div>}
    <label className="block text-sm font-semibold">Unit yang dikelola<select value={currentUnitId} onChange={(event) => setSelectedUnitId(event.target.value)} className={fieldClass} aria-label="Unit yang dikelola"><option value="">Pilih unit</option>{activeUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
    {currentUnitId ? <UnitWorkSchedulePanel key={currentUnitId} unitId={currentUnitId} unitName={activeUnits.find((unit) => unit.id === currentUnitId)?.name || "Unit"} /> : <p role="status" className="rounded-md border border-border bg-surface p-5">Tidak ada unit aktif yang dapat dikelola.</p>}
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card className="border border-border bg-surface p-5">
        <div className="mb-4 flex items-start justify-between gap-3"><div><h3 className="font-heading font-bold">Kalender Hari Libur</h3><p className="mt-1 text-xs">Libur nasional otomatis dan hanya dapat dibaca. Tambahkan libur khusus unit di bawah.</p></div>{holidayForm.id && <Button type="button" size="sm" variant="secondary" onClick={resetHoliday}>Batal Edit</Button>}</div>
        {currentUnitId && <form onSubmit={saveHoliday} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Tanggal<input required type="date" value={holidayForm.date} onChange={(event) => setHolidayForm({ ...holidayForm, date: event.target.value })} className={fieldClass} /></label><label className="text-xs font-semibold">Unit khusus<select required value={holidayForm.unitId} onChange={(event) => setHolidayForm({ ...holidayForm, unitId: event.target.value })} className={fieldClass}><option value="">Pilih unit</option>{activeUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label></div>
          <label className="block text-xs font-semibold">Nama libur khusus<input required minLength={2} maxLength={100} value={holidayForm.name} onChange={(event) => setHolidayForm({ ...holidayForm, name: event.target.value })} className={fieldClass} /></label>
          <label className="block text-xs font-semibold">Keterangan (opsional)<textarea value={holidayForm.description} onChange={(event) => setHolidayForm({ ...holidayForm, description: event.target.value })} className={fieldClass} /></label>
          <div className="flex justify-end"><Button type="submit" variant="primary" size="sm" disabled={submitting !== null}>{submitting === "holiday" ? "Menyimpan..." : holidayForm.id ? "Perbarui Hari Libur" : "Tambah Hari Libur Unit"}</Button></div>
        </form>}
        <div className="mt-5 border-t border-border pt-4">{holidays.length === 0 ? <p role="status" className="text-sm">Belum ada hari libur pada kalender efektif.</p> : <ul className="divide-y divide-border">{holidays.map((holiday) => <li key={holiday.id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-semibold">{formattedDate(holiday.date)}</p><p className="text-sm">{holiday.name}</p><p className="text-xs">{holiday.unitId === null ? "Nasional / semua unit" : activeUnits.find((unit) => unit.id === holiday.unitId)?.name || "Unit"}</p>{holiday.unitId === null && holiday.source === "provider" && <p className="text-xs text-tertiary">Diperbarui dari provider{holiday.providerSyncedAt ? ` · ${new Date(holiday.providerSyncedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB` : ""}</p>}</div>{holiday.unitId === null ? <span className="text-xs text-tertiary">Otomatis · hanya baca</span> : <div className="flex gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => setHolidayForm({ id: holiday.id, unitId: holiday.unitId!, date: dateValue(holiday.date), name: holiday.name, description: holiday.description || "" })}>Ubah</Button><Button type="button" size="sm" variant="danger" onClick={() => setDeleteTarget({ kind: "holiday", id: holiday.id, label: holiday.name })}>Hapus</Button></div>}</li>)}</ul>}</div>
      </Card>
      <Card className="border border-border bg-surface p-5">
        <div className="mb-4 flex items-start justify-between gap-3"><div><h3 className="font-heading font-bold">Daftar Piket Sabtu</h3><p className="mt-1 text-xs">Jam piket harus diisi secara eksplisit untuk setiap tugas baru.</p></div>{dutyForm.id && <Button type="button" size="sm" variant="secondary" onClick={resetDuty}>Batal Edit</Button>}</div>
        {currentUnitId && <form onSubmit={saveDuty} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Tanggal Sabtu<input required type="date" value={dutyForm.date} onChange={(event) => setDutyForm({ ...dutyForm, date: event.target.value })} className={fieldClass} /></label><label className="text-xs font-semibold">Unit<select required value={dutyForm.unitId} onChange={(event) => setDutyForm({ ...dutyForm, unitId: event.target.value })} className={fieldClass}><option value="">Pilih unit</option>{activeUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label></div>
          <label className="block text-xs font-semibold">Pegawai<select required value={dutyForm.userId} onChange={(event) => setDutyForm({ ...dutyForm, userId: event.target.value })} className={fieldClass}><option value="">Pilih pegawai</option>{activeEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold">Jam masuk<input required type="time" value={dutyForm.startTime} onChange={(event) => setDutyForm({ ...dutyForm, startTime: event.target.value })} className={fieldClass} /></label><label className="text-xs font-semibold">Toleransi terlambat (menit)<input required type="number" min="0" max="180" value={dutyForm.lateGraceMinutes} onChange={(event) => setDutyForm({ ...dutyForm, lateGraceMinutes: event.target.value })} className={fieldClass} /></label><label className="text-xs font-semibold">Jam pulang<input required type="time" value={dutyForm.endTime} onChange={(event) => setDutyForm({ ...dutyForm, endTime: event.target.value })} className={fieldClass} /></label><label className="text-xs font-semibold">Jam mulai lembur<input required type="time" value={dutyForm.overtimeStartTime} onChange={(event) => setDutyForm({ ...dutyForm, overtimeStartTime: event.target.value })} className={fieldClass} /></label></div>
          <label className="block text-xs font-semibold">Catatan (opsional)<textarea value={dutyForm.notes} onChange={(event) => setDutyForm({ ...dutyForm, notes: event.target.value })} className={fieldClass} /></label>
          <div className="flex justify-end"><Button type="submit" variant="primary" size="sm" disabled={submitting !== null}>{submitting === "duty" ? "Menyimpan..." : dutyForm.id ? "Perbarui Piket" : "Tambah Piket Sabtu"}</Button></div>
        </form>}
        <div className="mt-5 border-t border-border pt-4">{duties.length === 0 ? <p role="status" className="text-sm">Belum ada piket Sabtu.</p> : <ul className="divide-y divide-border">{duties.map((duty) => <li key={duty.id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-semibold">{formattedDate(duty.date)}</p><p className="text-sm">{activeEmployees.find((employee) => employee.id === duty.userId)?.fullName || "Pegawai"}</p><p className="text-xs">{activeUnits.find((unit) => unit.id === duty.unitId)?.name || "Unit"}{duty.notes ? ` · ${duty.notes}` : ""}</p>{!duty.startTime || duty.lateGraceMinutes == null || !duty.endTime || !duty.overtimeStartTime ? <p className="text-xs text-tertiary">Jam piket belum diatur</p> : <p className="text-xs">{duty.startTime}–{duty.endTime} · toleransi {duty.lateGraceMinutes} menit · lembur mulai {duty.overtimeStartTime}</p>}</div><div className="flex gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => setDutyForm({ id: duty.id, unitId: duty.unitId, userId: duty.userId, date: dateValue(duty.date), notes: duty.notes || "", startTime: duty.startTime || "", lateGraceMinutes: duty.lateGraceMinutes == null ? "" : String(duty.lateGraceMinutes), endTime: duty.endTime || "", overtimeStartTime: duty.overtimeStartTime || "" })}>Ubah</Button><Button type="button" size="sm" variant="danger" onClick={() => setDeleteTarget({ kind: "duty", id: duty.id, label: "piket Sabtu" })}>Hapus</Button></div></li>)}</ul>}</div>
      </Card>
    </div>
    {deleteTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-workday-title"><div className="w-full max-w-md rounded-md border border-border bg-surface p-5"><h3 id="delete-workday-title" className="font-heading font-bold">Hapus data?</h3><p className="mt-2 text-sm">{deleteTarget.label} akan dihapus dan tidak dapat dipulihkan.</p><div className="mt-5 flex justify-end gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => setDeleteTarget(null)} disabled={submitting === "delete"}>Batal</Button><Button type="button" size="sm" variant="danger" onClick={remove} disabled={submitting === "delete"}>{submitting === "delete" ? "Menghapus..." : "Hapus"}</Button></div></div></div>}
  </div>;
}
