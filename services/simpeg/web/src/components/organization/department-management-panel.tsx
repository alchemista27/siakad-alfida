"use client";

import { FormEvent, useState } from "react";
import { Badge, Button, Card, EmptyState } from "@alfida/ui";
import { ConfirmActionModal } from "./confirm-action-modal";
import { OrganizationDepartment, responseMessage } from "./types";

type DepartmentForm = { name: string; code: string; description: string; isActive: boolean };
const emptyForm: DepartmentForm = { name: "", code: "", description: "", isActive: true };

type DepartmentManagementPanelProps = {
  departments: OrganizationDepartment[];
  onRefresh: () => Promise<void> | void;
  onManageAdmins: (department: OrganizationDepartment) => void;
};

export function DepartmentManagementPanel({ departments, onRefresh, onManageAdmins }: DepartmentManagementPanelProps) {
  const [form, setForm] = useState<DepartmentForm>(emptyForm);
  const [editingDepartment, setEditingDepartment] = useState<OrganizationDepartment | null>(null);
  const [deleteDepartment, setDeleteDepartment] = useState<OrganizationDepartment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreate = () => { setForm(emptyForm); setEditingDepartment(null); setError(null); setIsFormOpen(true); };
  const openEdit = (department: OrganizationDepartment) => { setEditingDepartment(department); setForm({ name: department.name, code: department.code, description: department.description || "", isActive: department.isActive }); setError(null); setIsFormOpen(true); };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const department = editingDepartment;
      const response = await fetch(department ? `/api/departments/${department.id}` : "/api/departments", { method: department ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, name: form.name.trim(), code: form.code.trim(), description: form.description.trim() || undefined }) });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload, "Bidang gagal disimpan."));
      setIsFormOpen(false);
      await onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Bidang gagal disimpan.");
    } finally { setIsSubmitting(false); }
  };

  const remove = async () => {
    if (!deleteDepartment) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const department = deleteDepartment;
      const response = await fetch(`/api/departments/${department.id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload, "Bidang gagal dihapus."));
      setDeleteDepartment(null);
      await onRefresh();
    } catch (caught) {
      setDeleteDepartment(null);
      setError(caught instanceof Error ? caught.message : "Bidang gagal dihapus.");
    } finally { setIsSubmitting(false); }
  };

  return <section className="space-y-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="font-heading text-xl font-bold text-primary">Bidang & Departemen</h2><p className="mt-1 text-sm text-slate-500">Struktur bidang yayasan dan akses strategis SIMAKIN.</p></div><Button variant="primary" size="sm" onClick={openCreate}>Tambah Bidang</Button></div>{error && <p className="rounded-sm border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</p>}{departments.length === 0 ? <EmptyState title="Belum ada bidang/departemen" description="Tambahkan bidang untuk membangun struktur organisasi." actionLabel="Tambah Bidang" onAction={openCreate} /> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{departments.map((department) => <Card key={department.id} className="space-y-4 p-5"><div className="flex justify-between gap-3"><div><p className="font-semibold text-primary">{department.name}</p><p className="mt-1 font-mono text-xs text-slate-500">{department.code}</p></div><Badge variant={department.isActive ? "success" : "neutral"}>{department.isActive ? "Aktif" : "Tidak aktif"}</Badge></div><p className="min-h-10 text-sm text-slate-600">{department.description || "Belum ada deskripsi bidang."}</p><div className="flex flex-wrap gap-2 border-t border-border pt-3"><Button size="sm" variant="secondary" onClick={() => openEdit(department)}>Edit</Button><Button size="sm" variant="secondary" onClick={() => onManageAdmins(department)}>Admin Bidang SIMAKIN</Button><Button size="sm" variant="danger" onClick={() => setDeleteDepartment(department)}>Hapus Bidang</Button></div></Card>)}</div>}{isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="department-form-title"><form onSubmit={submit} className="w-full max-w-lg rounded-md border border-border bg-surface p-5"><div className="flex items-start justify-between border-b border-border pb-3"><div><h3 id="department-form-title" className="font-heading text-lg font-bold text-primary">{editingDepartment ? "Edit Bidang" : "Tambah Bidang"}</h3><p className="mt-1 text-xs text-slate-500">Bidang aktif dapat memiliki Admin Bidang SIMAKIN.</p></div><button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-500" aria-label="Tutup formulir bidang"><span className="material-symbols-rounded" aria-hidden="true">close</span></button></div><div className="mt-4 grid gap-4"><label className="text-xs font-semibold text-primary">Nama<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" /></label><label className="text-xs font-semibold text-primary">Kode<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 font-mono text-sm" /></label><label className="text-xs font-semibold text-primary">Deskripsi<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" /></label>{editingDepartment && <label className="flex items-center gap-2 text-sm text-primary"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />Bidang aktif</label>}</div><div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" size="sm" onClick={() => setIsFormOpen(false)}>Batal</Button><Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button></div></form></div>}<ConfirmActionModal isOpen={Boolean(deleteDepartment)} title="Hapus Bidang" description={`Bidang ${deleteDepartment?.name || "ini"} akan dihapus. Semua penugasan Admin Bidang SIMAKIN akan dicabut dan SIMAKIN menerima event penghapusan.`} confirmLabel="Hapus Bidang" isDestructive isSubmitting={isSubmitting} onCancel={() => setDeleteDepartment(null)} onConfirm={remove} /></section>;
}
