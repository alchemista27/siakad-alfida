"use client";

import { FormEvent, useState } from "react";
import { Badge, Button, Card, EmptyState } from "@alfida/ui";
import { ConfirmActionModal } from "./confirm-action-modal";
import { UnitLetterheadProfileModal } from "./unit-letterhead-profile-modal";
import { OrganizationUnit, UnitCategory, responseMessage } from "./types";

type UnitForm = {
  name: string;
  code: string;
  category: UnitCategory;
  address: string;
  isActive: boolean;
};

const emptyForm: UnitForm = { name: "", code: "", category: "pendidikan", address: "", isActive: true };

type UnitManagementPanelProps = {
  units: OrganizationUnit[];
  canManageAllUnits: boolean;
  manageableUnitIds: string[];
  onRefresh: () => Promise<void> | void;
  onManageAdmins: (unit: OrganizationUnit) => void;
};

export function UnitManagementPanel({ units, canManageAllUnits, manageableUnitIds, onRefresh, onManageAdmins }: UnitManagementPanelProps) {
  const [form, setForm] = useState<UnitForm>(emptyForm);
  const [editingUnit, setEditingUnit] = useState<OrganizationUnit | null>(null);
  const [letterheadUnit, setLetterheadUnit] = useState<OrganizationUnit | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteUnit, setDeleteUnit] = useState<OrganizationUnit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingUnit(null);
    setError(null);
    setIsFormOpen(true);
  };

  const openEdit = (unit: OrganizationUnit) => {
    setEditingUnit(unit);
    setForm({ name: unit.name, code: unit.code, category: unit.category, address: unit.address || "", isActive: unit.isActive });
    setError(null);
    setIsFormOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const unit = editingUnit;
      const response = await fetch(unit ? `/api/units/${unit.id}` : "/api/units", {
        method: unit ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, name: form.name.trim(), code: form.code.trim(), address: form.address.trim() || undefined }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload, "Unit gagal disimpan."));
      setIsFormOpen(false);
      await onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unit gagal disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async () => {
    if (!deleteUnit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const unit = deleteUnit;
      const response = await fetch(`/api/units/${unit.id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload, "Unit gagal dihapus."));
      setDeleteUnit(null);
      await onRefresh();
    } catch (caught) {
      setDeleteUnit(null);
      setError(caught instanceof Error ? caught.message : "Unit gagal dihapus.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-heading text-xl font-bold text-primary">Unit & Lokasi Kerja</h2>
          <p className="mt-1 text-sm text-slate-500">Master unit pendidikan dan non-pendidikan untuk penugasan serta lokasi presensi.</p>
        </div>
        {canManageAllUnits && <Button variant="primary" size="sm" onClick={openCreate}>Tambah Unit</Button>}
      </div>

      {error && <p className="rounded-sm border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Unit</p><p className="mt-1 text-2xl font-bold text-primary">{units.length}</p></Card>
        <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unit Aktif</p><p className="mt-1 text-2xl font-bold text-tertiary">{units.filter((unit) => unit.isActive).length}</p></Card>
        <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unit Pendidikan</p><p className="mt-1 text-2xl font-bold text-primary">{units.filter((unit) => unit.category === "pendidikan").length}</p></Card>
      </div>

      {units.length === 0 ? (
        <EmptyState title="Belum ada unit kerja" description="Tambahkan unit sekolah, pesantren, atau kantor yayasan sebelum membuat penugasan pegawai." actionLabel={canManageAllUnits ? "Tambah Unit" : undefined} onAction={canManageAllUnits ? openCreate : undefined} />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full text-left text-sm"><thead className="bg-neutral text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Unit</th><th className="px-5 py-3">Kode</th><th className="px-5 py-3">Kategori</th><th className="px-5 py-3">Alamat / Lokasi</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-border">
            {units.map((unit) => {
              const canManageProfile = unit.category === "pendidikan" && (canManageAllUnits || manageableUnitIds.includes(unit.id));
              return <tr key={unit.id}><td className="px-5 py-4 font-semibold text-primary">{unit.name}</td><td className="px-5 py-4 font-mono text-xs">{unit.code}</td><td className="px-5 py-4 capitalize">{unit.category}</td><td className="px-5 py-4 text-slate-600">{unit.address || "Belum diatur"}</td><td className="px-5 py-4"><Badge variant={unit.isActive ? "success" : "neutral"}>{unit.isActive ? "Aktif" : "Tidak aktif"}</Badge></td><td className="px-5 py-4"><div className="flex justify-end gap-2">{canManageProfile && <Button size="sm" variant="secondary" onClick={() => setLetterheadUnit(unit)}>Profil Unit</Button>}{canManageAllUnits && <><Button size="sm" variant="secondary" onClick={() => openEdit(unit)}>Edit</Button><Button size="sm" variant="secondary" onClick={() => onManageAdmins(unit)}>Admin Unit</Button><Button size="sm" variant="danger" onClick={() => setDeleteUnit(unit)}>Hapus Unit</Button></>}</div></td></tr>;
            })}
          </tbody></table>
        </div>
      )}

      {isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="unit-form-title"><form onSubmit={submit} className="w-full max-w-lg rounded-md border border-border bg-surface p-5"><div className="flex items-start justify-between border-b border-border pb-3"><div><h3 id="unit-form-title" className="font-heading text-lg font-bold text-primary">{editingUnit ? "Edit Unit" : "Tambah Unit"}</h3><p className="mt-1 text-xs text-slate-500">Kode unit akan dipakai oleh penugasan dan konfigurasi GPS.</p></div><button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-500" aria-label="Tutup formulir unit"><span className="material-symbols-rounded" aria-hidden="true">close</span></button></div><div className="mt-4 grid gap-4"><label className="text-xs font-semibold text-primary">Nama<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" /></label><label className="text-xs font-semibold text-primary">Kode<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 font-mono text-sm" /></label><label className="text-xs font-semibold text-primary">Kategori<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as UnitCategory })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="pendidikan">Pendidikan</option><option value="nondik">Non-pendidikan</option></select></label><label className="text-xs font-semibold text-primary">Alamat / lokasi<textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} rows={3} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" /></label>{editingUnit && <label className="flex items-center gap-2 text-sm text-primary"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />Unit aktif</label>}</div><div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" size="sm" onClick={() => setIsFormOpen(false)}>Batal</Button><Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button></div></form></div>}

      {letterheadUnit && <UnitLetterheadProfileModal unit={letterheadUnit} onClose={() => setLetterheadUnit(null)} onSaved={onRefresh} />}
      <ConfirmActionModal isOpen={Boolean(deleteUnit)} title="Hapus Unit" description={`Unit ${deleteUnit?.name || "ini"} akan dihapus permanen jika belum dipakai data lain.`} confirmLabel="Hapus Unit" isDestructive isSubmitting={isSubmitting} onCancel={() => setDeleteUnit(null)} onConfirm={remove} />
    </section>
  );
}
