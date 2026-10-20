"use client";

import { useState } from "react";
import { Button, Card } from "@alfida/ui";
import type { OrganizationEmployee, OrganizationUnit } from "../organization/types";

type Holiday = {
  id: string;
  unitId: string | null;
  date: string;
  name: string;
  description?: string | null;
};

type SaturdayDuty = {
  id: string;
  unitId: string;
  userId: string;
  date: string;
  notes?: string | null;
};

type DeleteTarget = { kind: "holiday" | "duty"; id: string; label: string } | null;

function dateValue(value: string) {
  return value.slice(0, 10);
}

async function errorMessage(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
  if (Array.isArray(payload?.message)) return payload.message.join(" ");
  return typeof payload?.message === "string" ? payload.message : fallback;
}

export function WorkdayManagementPanel({
  holidays,
  duties,
  units,
  employees,
  onChanged,
}: {
  holidays: Holiday[];
  duties: SaturdayDuty[];
  units: OrganizationUnit[];
  employees: OrganizationEmployee[];
  onChanged: () => Promise<void> | void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [holidayForm, setHolidayForm] = useState({ id: "", unitId: "", date: today, name: "", description: "" });
  const [dutyForm, setDutyForm] = useState({ id: "", unitId: "", userId: "", date: today, notes: "" });
  const [submitting, setSubmitting] = useState<"holiday" | "duty" | "delete" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const resetHoliday = () => setHolidayForm({ id: "", unitId: "", date: today, name: "", description: "" });
  const resetDuty = () => setDutyForm({ id: "", unitId: "", userId: "", date: today, notes: "" });

  const saveHoliday = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting("holiday");
    setMessage(null);
    try {
      const response = await fetch("/api/attendance/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(holidayForm.id ? { id: holidayForm.id } : {}),
          unitId: holidayForm.unitId || null,
          date: holidayForm.date,
          name: holidayForm.name,
          description: holidayForm.description || undefined,
        }),
      });
      if (!response.ok) throw new Error(await errorMessage(response, "Hari libur gagal disimpan."));
      resetHoliday();
      setMessage({ type: "success", text: "Hari libur berhasil disimpan." });
      await onChanged();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Hari libur gagal disimpan." });
    } finally {
      setSubmitting(null);
    }
  };

  const saveDuty = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting("duty");
    setMessage(null);
    try {
      const response = await fetch("/api/attendance/saturday-duties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(dutyForm.id ? { id: dutyForm.id } : {}),
          unitId: dutyForm.unitId,
          userId: dutyForm.userId,
          date: dutyForm.date,
          notes: dutyForm.notes || undefined,
        }),
      });
      if (!response.ok) throw new Error(await errorMessage(response, "Piket Sabtu gagal disimpan."));
      resetDuty();
      setMessage({ type: "success", text: "Piket Sabtu berhasil disimpan." });
      await onChanged();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Piket Sabtu gagal disimpan." });
    } finally {
      setSubmitting(null);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setSubmitting("delete");
    setMessage(null);
    try {
      const path = deleteTarget.kind === "holiday"
        ? `/api/attendance/holidays/${deleteTarget.id}`
        : `/api/attendance/saturday-duties/${deleteTarget.id}`;
      const response = await fetch(path, { method: "DELETE" });
      if (!response.ok) throw new Error(await errorMessage(response, "Data gagal dihapus."));
      setDeleteTarget(null);
      setMessage({ type: "success", text: "Data berhasil dihapus." });
      await onChanged();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Data gagal dihapus." });
    } finally {
      setSubmitting(null);
    }
  };

  const activeUnits = units.filter((unit) => unit.isActive);
  const activeEmployees = employees.filter((employee) => employee.isActive !== false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-primary">Kalender Hari Libur & Piket Sabtu</h2>
        <p className="mt-1 text-sm text-slate-500">Hari libur nasional berlaku untuk semua unit. Piket Sabtu hanya berlaku pada tanggal dan unit yang ditetapkan.</p>
      </div>

      {message && (
        <div className={`flex items-center justify-between rounded-sm border p-3 text-sm ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`} role="status">
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="font-semibold">Tutup</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border border-border bg-surface p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div><h3 className="font-heading font-bold text-primary">Kalender Hari Libur</h3><p className="mt-1 text-xs text-slate-500">Pilih “Nasional” hanya untuk hari libur yang berlaku global.</p></div>
            {holidayForm.id && <Button type="button" size="sm" variant="secondary" onClick={resetHoliday}>Batal Edit</Button>}
          </div>
          <form onSubmit={saveHoliday} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-primary">Tanggal<input required type="date" value={holidayForm.date} onChange={(event) => setHolidayForm({ ...holidayForm, date: event.target.value })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" /></label>
              <label className="text-xs font-semibold text-primary">Cakupan<select value={holidayForm.unitId} onChange={(event) => setHolidayForm({ ...holidayForm, unitId: event.target.value })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Nasional / semua unit</option>{activeUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
            </div>
            <label className="block text-xs font-semibold text-primary">Nama hari libur<input required minLength={2} maxLength={100} value={holidayForm.name} onChange={(event) => setHolidayForm({ ...holidayForm, name: event.target.value })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" placeholder="Contoh: Hari Raya Idulfitri" /></label>
            <label className="block text-xs font-semibold text-primary">Keterangan (opsional)<textarea value={holidayForm.description} onChange={(event) => setHolidayForm({ ...holidayForm, description: event.target.value })} className="mt-1.5 min-h-20 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" /></label>
            <div className="flex justify-end"><Button type="submit" variant="primary" size="sm" disabled={submitting !== null}>{submitting === "holiday" ? "Menyimpan..." : holidayForm.id ? "Perbarui Hari Libur" : "Tambah Hari Libur"}</Button></div>
          </form>
          <div className="mt-5 border-t border-border pt-4">
            {holidays.length === 0 ? <p className="text-sm text-slate-500">Belum ada hari libur yang dapat Anda kelola.</p> : <ul className="divide-y divide-border">{holidays.map((holiday) => <li key={holiday.id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-semibold text-primary">{new Date(`${dateValue(holiday.date)}T00:00:00Z`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</p><p className="text-sm text-slate-700">{holiday.name}</p><p className="text-xs text-slate-500">{holiday.unitId ? activeUnits.find((unit) => unit.id === holiday.unitId)?.name || "Unit" : "Nasional / semua unit"}</p></div><div className="flex gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => setHolidayForm({ id: holiday.id, unitId: holiday.unitId || "", date: dateValue(holiday.date), name: holiday.name, description: holiday.description || "" })}>Ubah</Button><Button type="button" size="sm" variant="danger" onClick={() => setDeleteTarget({ kind: "holiday", id: holiday.id, label: holiday.name })}>Hapus</Button></div></li>)}</ul>}
          </div>
        </Card>

        <Card className="border border-border bg-surface p-5">
          <div className="mb-4 flex items-start justify-between gap-3"><div><h3 className="font-heading font-bold text-primary">Daftar Piket Sabtu</h3><p className="mt-1 text-xs text-slate-500">Pegawai harus memiliki penugasan aktif pada unit dan tanggal piket.</p></div>{dutyForm.id && <Button type="button" size="sm" variant="secondary" onClick={resetDuty}>Batal Edit</Button>}</div>
          <form onSubmit={saveDuty} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-primary">Tanggal Sabtu<input required type="date" value={dutyForm.date} onChange={(event) => setDutyForm({ ...dutyForm, date: event.target.value })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" /></label><label className="text-xs font-semibold text-primary">Unit<select required value={dutyForm.unitId} onChange={(event) => setDutyForm({ ...dutyForm, unitId: event.target.value })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Pilih unit</option>{activeUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label></div>
            <label className="block text-xs font-semibold text-primary">Pegawai<select required value={dutyForm.userId} onChange={(event) => setDutyForm({ ...dutyForm, userId: event.target.value })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Pilih pegawai</option>{activeEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}</select></label>
            <label className="block text-xs font-semibold text-primary">Catatan (opsional)<textarea value={dutyForm.notes} onChange={(event) => setDutyForm({ ...dutyForm, notes: event.target.value })} className="mt-1.5 min-h-20 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" /></label>
            <div className="flex justify-end"><Button type="submit" variant="primary" size="sm" disabled={submitting !== null}>{submitting === "duty" ? "Menyimpan..." : dutyForm.id ? "Perbarui Piket" : "Tambah Piket Sabtu"}</Button></div>
          </form>
          <div className="mt-5 border-t border-border pt-4">
            {duties.length === 0 ? <p className="text-sm text-slate-500">Belum ada piket Sabtu yang dapat Anda kelola.</p> : <ul className="divide-y divide-border">{duties.map((duty) => <li key={duty.id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-semibold text-primary">{new Date(`${dateValue(duty.date)}T00:00:00Z`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</p><p className="text-sm text-slate-700">{activeEmployees.find((employee) => employee.id === duty.userId)?.fullName || "Pegawai"}</p><p className="text-xs text-slate-500">{activeUnits.find((unit) => unit.id === duty.unitId)?.name || "Unit"}{duty.notes ? ` • ${duty.notes}` : ""}</p></div><div className="flex gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => setDutyForm({ id: duty.id, unitId: duty.unitId, userId: duty.userId, date: dateValue(duty.date), notes: duty.notes || "" })}>Ubah</Button><Button type="button" size="sm" variant="danger" onClick={() => setDeleteTarget({ kind: "duty", id: duty.id, label: "piket Sabtu" })}>Hapus</Button></div></li>)}</ul>}
          </div>
        </Card>
      </div>

      {deleteTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-workday-title"><div className="w-full max-w-md rounded-md border border-border bg-surface p-5"><h3 id="delete-workday-title" className="font-heading font-bold text-primary">Hapus data?</h3><p className="mt-2 text-sm text-slate-600">{deleteTarget.label} akan dihapus dan tidak dapat dipulihkan.</p><div className="mt-5 flex justify-end gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => setDeleteTarget(null)} disabled={submitting === "delete"}>Batal</Button><Button type="button" size="sm" variant="danger" onClick={remove} disabled={submitting === "delete"}>{submitting === "delete" ? "Menghapus..." : "Hapus"}</Button></div></div></div>}
    </div>
  );
}
