"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, EmptyState, ErrorState, LoadingState } from "@alfida/ui";
import { ConfirmActionModal } from "../organization/confirm-action-modal";
import { responseMessage } from "../organization/types";

type Employee = { id: string; fullName: string; email?: string | null; isActive?: boolean };

export function YmqAdminManager() {
  const [admins, setAdmins] = useState<Employee[]>([]);
  const [suggestions, setSuggestions] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ymq/roles/admins");
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload, "Daftar Admin YMQ gagal dimuat."));
      setAdmins(Array.isArray(payload) ? payload : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Daftar Admin YMQ gagal dimuat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadAdmins(); }, []);

  const search = async (event: FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    setSelected(null);
    if (!term) {
      setSuggestions([]);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/employees/suggestions?search=${encodeURIComponent(term)}`);
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload, "Pencarian pegawai gagal."));
      setSuggestions(Array.isArray(payload) ? payload : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Pencarian pegawai gagal.");
    } finally {
      setSaving(false);
    }
  };

  const assign = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/ymq/roles/admins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: selected.id }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload, "Admin YMQ gagal ditetapkan."));
      await loadAdmins();
      setNotice(`${selected.fullName} telah ditetapkan sebagai Admin YMQ. Sesi aktif pengguna tersebut dicabut agar peran baru berlaku saat login berikutnya.`);
      setSelected(null);
      setSuggestions([]);
      setQuery("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Admin YMQ gagal ditetapkan.");
    } finally {
      setSaving(false);
    }
  };

  const revoke = async () => {
    if (!revokeTarget) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/ymq/roles/admins/${revokeTarget.id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload, "Admin YMQ gagal dicabut."));
      await loadAdmins();
      setNotice(`Akses Admin YMQ untuk ${revokeTarget.fullName} telah dicabut dan sesi aktifnya diakhiri.`);
      setRevokeTarget(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Admin YMQ gagal dicabut.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Memuat Admin YMQ..." />;
  if (error && admins.length === 0) return <ErrorState message={error} onRetry={loadAdmins} />;

  return <section className="space-y-5">
    <header className="border-b border-border pb-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Governance SIYAUM</p>
      <h2 className="mt-1 font-heading text-2xl font-bold text-primary">Admin YMQ</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-primary/70">Hanya Super Admin yang dapat menetapkan atau mencabut Admin YMQ. Admin YMQ kemudian mengelola peserta, pembina, admin kelompok, serta kelompok dari SIYAUM.</p>
    </header>
    {error && <p className="rounded-sm border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</p>}
    {notice && <p className="rounded-sm border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{notice}</p>}
    <Card className="border border-border bg-surface p-5 shadow-none">
      <form onSubmit={search} className="space-y-3">
        <label className="block text-sm font-semibold text-primary">Cari pegawai</label>
        <div className="flex flex-col gap-2 sm:flex-row"><input className="min-w-0 flex-1 rounded-sm border border-border bg-surface px-3 py-2 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama atau email pegawai" /><Button type="submit" variant="secondary" disabled={saving || !query.trim()}>Cari</Button></div>
      </form>
      {suggestions.length > 0 && <ul className="mt-4 divide-y divide-border rounded-sm border border-border">{suggestions.map((employee) => <li className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between" key={employee.id}><span><strong className="block text-sm text-primary">{employee.fullName}</strong><small className="text-xs text-primary/60">{employee.email || "Email tidak tersedia"}</small></span><Button type="button" size="sm" variant={selected?.id === employee.id ? "primary" : "outline"} onClick={() => setSelected(employee)}>{selected?.id === employee.id ? "Dipilih" : "Pilih"}</Button></li>)}</ul>}
      {selected && <div className="mt-4 flex flex-col gap-3 rounded-sm border border-tertiary/30 bg-tertiary/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-primary"><strong>{selected.fullName}</strong> akan menerima peran Admin YMQ.</p><Button type="button" size="sm" disabled={saving} onClick={() => void assign()}>Tetapkan Admin YMQ</Button></div>}
    </Card>
    <Card className="border border-border bg-surface p-5 shadow-none"><div className="flex items-end justify-between gap-3"><div><h3 className="font-heading text-xl font-bold text-primary">Admin YMQ aktif</h3><p className="mt-1 text-sm text-primary/65">Perubahan di bawah dibaca kembali dari Auth sebagai sumber kebenaran.</p></div><Button type="button" size="sm" variant="secondary" disabled={saving} onClick={() => void loadAdmins()}>Segarkan</Button></div>{admins.length === 0 ? <EmptyState title="Belum ada Admin YMQ" description="Pilih pegawai aktif di atas untuk memulai administrasi YMQ." /> : <ul className="mt-4 divide-y divide-border rounded-sm border border-border">{admins.map((admin) => <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={admin.id}><span><strong className="block text-sm text-primary">{admin.fullName}</strong><small className="text-xs text-primary/60">{admin.email || "Email tidak tersedia"}</small></span><Button type="button" size="sm" variant="danger" disabled={saving} onClick={() => setRevokeTarget(admin)}>Cabut akses</Button></li>)}</ul>}</Card>
    <ConfirmActionModal isOpen={Boolean(revokeTarget)} title="Cabut Admin YMQ" description={`Akses Admin YMQ untuk ${revokeTarget?.fullName || "pengguna ini"} akan dicabut. Sesi aktifnya akan diakhiri.`} confirmLabel="Cabut akses" isDestructive isSubmitting={saving} onCancel={() => setRevokeTarget(null)} onConfirm={revoke} />
  </section>;
}
