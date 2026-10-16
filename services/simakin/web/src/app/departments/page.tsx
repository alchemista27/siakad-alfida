"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SimakinShell } from "@/components/simakin-shell";
import { ConfirmModal } from "@/components/confirm-modal";
import {
  assignBureauAdmin,
  createBureau,
  getDepartments,
  getMyMembers,
  getMySubdepartments,
  removeBureauAdmin,
  type DepartmentMember,
  type ScopedBureau,
} from "@/actions/strategic";
import { EmptyState, ErrorState, LoadingState } from "@alfida/ui";

interface AuthRole { role?: string; departmentId?: string | null; }
interface AuthUser { roles?: AuthRole[]; }
interface Department { id: string; name: string; code?: string | null; description?: string | null; parentId?: string | null; parent?: { id: string; name: string } | null; }

const emptyBureau = { name: "", code: "", description: "", adminUserId: "" };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [bureaus, setBureaus] = useState<ScopedBureau[]>([]);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [managingBureau, setManagingBureau] = useState<ScopedBureau | null>(null);
  const [bureauForm, setBureauForm] = useState(emptyBureau);
  const [selectedBidangId, setSelectedBidangId] = useState("");
  const [newAdminId, setNewAdminId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removingAdmin, setRemovingAdmin] = useState<{ biroId: string; userId: string; name: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [departmentData, bureauData, memberData] = await Promise.all([
        getDepartments(),
        getMySubdepartments().catch(() => []),
        getMyMembers().catch(() => []),
      ]);
      setDepartments(Array.isArray(departmentData) ? departmentData as Department[] : []);
      setBureaus(Array.isArray(bureauData) ? bureauData : []);
      setMembers(Array.isArray(memberData) ? memberData : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal memuat struktur Bidang dan Biro.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("https://auth.alfida.or.id/api/auth/me", { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null));
    void fetchData();
  }, [fetchData]);

  const roleNames = user?.roles?.map((role) => role.role).filter((role): role is string => Boolean(role)) || [];
  const isSuperAdmin = roleNames.includes("super_admin");
  const isAdminBidang = isSuperAdmin || roleNames.includes("admin_bidang");
  const isReadOnly = roleNames.includes("pimpinan") || roleNames.includes("pengawas");
  const assignedBidangIds = useMemo(() => user?.roles?.filter((role) => role.role === "admin_bidang" && role.departmentId).map((role) => role.departmentId as string) || [], [user]);
  const bidang = useMemo(() => departments.filter((department) => !department.parentId && (isSuperAdmin || assignedBidangIds.includes(department.id))), [assignedBidangIds, departments, isSuperAdmin]);
  const visibleBidang = useMemo(() => bidang.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || (item.code || "").toLowerCase().includes(search.toLowerCase())), [bidang, search]);
  const employeeOptions = useMemo(() => {
    const seen = new Set<string>();
    return members.filter((member) => member.user?.id && !seen.has(member.user.id) && Boolean(seen.add(member.user.id)));
  }, [members]);

  const openCreate = (bidangId?: string) => {
    setSelectedBidangId(bidangId || bidang[0]?.id || "");
    setBureauForm(emptyBureau);
    setFeedback(null);
    setIsCreateOpen(true);
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedBidangId || !bureauForm.name.trim() || !bureauForm.code.trim() || !bureauForm.adminUserId) {
      setFeedback("Nama, kode, Bidang induk, dan Admin Biro awal wajib diisi.");
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      await createBureau(selectedBidangId, { name: bureauForm.name.trim(), code: bureauForm.code.trim(), description: bureauForm.description.trim() || undefined, adminUserId: bureauForm.adminUserId });
      setIsCreateOpen(false);
      setFeedback("Biro dan Admin Biro awal berhasil ditetapkan.");
      await fetchData();
    } catch (caught) {
      setFeedback(caught instanceof Error ? caught.message : "Biro belum dapat dibuat.");
    } finally {
      setSubmitting(false);
    }
  };

  const addAdmin = async () => {
    if (!managingBureau || !newAdminId) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      await assignBureauAdmin(managingBureau.id, newAdminId);
      setNewAdminId("");
      setFeedback("Admin Biro ditambahkan.");
      await fetchData();
      const updated = (await getMySubdepartments()).find((bureau) => bureau.id === managingBureau.id) || null;
      setManagingBureau(updated);
    } catch (caught) {
      setFeedback(caught instanceof Error ? caught.message : "Admin Biro belum dapat ditambahkan.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeAdmin = async () => {
    if (!removingAdmin) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      await removeBureauAdmin(removingAdmin.biroId, removingAdmin.userId);
      setRemovingAdmin(null);
      setFeedback("Penetapan Admin Biro dicabut.");
      await fetchData();
      setManagingBureau((current) => current ? { ...current, admins: current.admins?.filter((admin) => admin.user.id !== removingAdmin.userId) } : current);
    } catch (caught) {
      setFeedback(caught instanceof Error ? caught.message : "Admin Biro belum dapat dihapus.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SimakinShell activePath="/departments">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div><h1 className="font-heading text-2xl font-bold text-primary">Struktur Bidang & Biro</h1><p className="mt-1 text-xs text-gray-500">Bidang berasal dari SIMPEG dan bersifat baca saja. Admin Bidang hanya mengelola Biro di dalam scope penugasannya.</p></div>
          {isAdminBidang && <button type="button" onClick={() => openCreate()} className="inline-flex items-center gap-1.5 self-start rounded-sm bg-tertiary px-4 py-2 text-xs font-semibold text-on-tertiary hover:bg-emerald-700"><span className="material-symbols-rounded text-[18px]">add</span>Tambah Biro</button>}
        </div>
        <div className="mt-5"><label className="sr-only" htmlFor="search-structure">Cari Bidang</label><input id="search-structure" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari Bidang atau kode…" className="w-full max-w-md rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary outline-none focus:ring-2 focus:ring-tertiary" /></div>
        {feedback && <p className="mt-4 rounded-sm border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900" role="status">{feedback}</p>}
        <div className="mt-6">
          {loading ? <LoadingState message="Memuat struktur Bidang dan Biro..." /> : error ? <ErrorState title="Gagal Memuat Struktur" message={error} onRetry={fetchData} /> : visibleBidang.length === 0 ? <EmptyState title={isReadOnly ? "Tidak Ada Struktur untuk Ditampilkan" : "Tidak Ada Bidang Dalam Scope Anda"} description="Struktur Bidang ditampilkan sesuai scope peran Anda." /> : <div className="grid gap-4 lg:grid-cols-2">{visibleBidang.map((item) => {
            const childBureaus = bureaus.filter((bureau) => bureau.parentId === item.id);
            return <section key={item.id} className="rounded-lg border border-border bg-surface p-5"><div className="flex items-start justify-between gap-3 border-b border-border pb-3"><div><div className="flex items-center gap-2"><span className="material-symbols-rounded text-tertiary">domain</span><h2 className="font-heading text-lg font-bold text-primary">{item.name}</h2></div><p className="mt-1 text-xs text-gray-500">{item.code || "Tanpa kode"} · Bidang SIMPEG (baca saja)</p></div>{isAdminBidang && <button type="button" onClick={() => openCreate(item.id)} className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-tertiary hover:bg-neutral">Tambah Biro</button>}</div><p className="mt-3 text-xs text-gray-600">{item.description || "Tidak ada deskripsi Bidang."}</p><div className="mt-4 space-y-2">{childBureaus.length === 0 ? <p className="rounded-sm border border-dashed border-border bg-neutral p-3 text-xs text-gray-500">Belum ada Biro di bawah Bidang ini.</p> : childBureaus.map((bureau) => <div key={bureau.id} className="rounded-sm border border-border bg-neutral p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-primary">{bureau.name}</p><p className="mt-0.5 text-[11px] text-gray-500">{bureau.code || "Tanpa kode"} · {bureau.admins?.length || 0} Admin Biro</p></div>{isAdminBidang && <button type="button" onClick={() => setManagingBureau(bureau)} className="rounded-sm border border-border px-2.5 py-1 text-[11px] font-semibold text-tertiary hover:bg-surface">Kelola admin</button>}</div><p className="mt-2 text-[11px] text-gray-600">{bureau.description || "Tidak ada deskripsi Biro."}</p></div>)}</div></section>;
          })}</div>}
        </div>
      </div>
      {isCreateOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true"><form onSubmit={create} className="w-full max-w-md rounded-lg border border-border bg-surface p-5"><div className="flex items-start justify-between border-b border-border pb-3"><div><h2 className="font-heading text-base font-bold text-primary">Tambah Biro</h2><p className="mt-1 text-xs text-gray-500">Biro wajib memiliki Admin Biro awal.</p></div><button type="button" onClick={() => setIsCreateOpen(false)} className="text-gray-500"><span className="material-symbols-rounded">close</span></button></div><div className="mt-4 space-y-3"><select required value={selectedBidangId} onChange={(event) => setSelectedBidangId(event.target.value)} className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary"><option value="">Pilih Bidang</option>{bidang.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input required value={bureauForm.name} onChange={(event) => setBureauForm({ ...bureauForm, name: event.target.value })} placeholder="Nama Biro" className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary" /><input required value={bureauForm.code} onChange={(event) => setBureauForm({ ...bureauForm, code: event.target.value.toUpperCase() })} placeholder="Kode Biro" className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary" /><textarea value={bureauForm.description} onChange={(event) => setBureauForm({ ...bureauForm, description: event.target.value })} rows={3} placeholder="Deskripsi (opsional)" className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary" /><select required value={bureauForm.adminUserId} onChange={(event) => setBureauForm({ ...bureauForm, adminUserId: event.target.value })} className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary"><option value="">Pilih Admin Biro awal</option>{employeeOptions.map((member) => <option key={member.user.id} value={member.user.id}>{member.user.fullName} {member.user.email ? `(${member.user.email})` : ""}</option>)}</select>{employeeOptions.length === 0 && <p className="text-[11px] text-amber-800">Tidak ada pegawai dalam scope yang dapat dipilih. Tambahkan anggota melalui proses yang berwenang terlebih dahulu.</p>}</div><div className="mt-5 flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => setIsCreateOpen(false)} disabled={submitting} className="rounded-sm border border-border px-4 py-2 text-xs font-semibold text-primary">Batal</button><button type="submit" disabled={submitting} className="rounded-sm bg-tertiary px-4 py-2 text-xs font-semibold text-on-tertiary disabled:opacity-50">{submitting ? "Menyimpan..." : "Buat Biro"}</button></div></form></div>}
      {managingBureau && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-lg border border-border bg-surface p-5"><div className="flex items-start justify-between border-b border-border pb-3"><div><h2 className="font-heading text-base font-bold text-primary">Admin Biro: {managingBureau.name}</h2><p className="mt-1 text-xs text-gray-500">Riwayat waktu ditampilkan jika tersedia dari API.</p></div><button type="button" onClick={() => setManagingBureau(null)} className="text-gray-500"><span className="material-symbols-rounded">close</span></button></div><div className="mt-4 space-y-2">{managingBureau.admins?.length ? managingBureau.admins.map((admin) => <div key={admin.user.id} className="flex items-center justify-between rounded-sm border border-border bg-neutral p-3"><div><p className="text-xs font-semibold text-primary">{admin.user.fullName}</p><p className="text-[11px] text-gray-500">{admin.user.email || ""} · Audit: {admin.createdAt ? new Date(admin.createdAt).toLocaleString("id-ID") : "tidak tersedia"}</p></div><button type="button" onClick={() => setRemovingAdmin({ biroId: managingBureau.id, userId: admin.user.id, name: admin.user.fullName })} className="rounded-sm border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-50">Cabut</button></div>) : <p className="text-xs text-gray-500">Belum ada Admin Biro.</p>}</div><div className="mt-4 border-t border-border pt-4"><label className="text-xs font-semibold text-primary" htmlFor="new-bureau-admin">Tambah Admin Biro</label><div className="mt-2 flex gap-2"><select id="new-bureau-admin" value={newAdminId} onChange={(event) => setNewAdminId(event.target.value)} className="min-w-0 flex-1 rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary"><option value="">Pilih pegawai</option>{employeeOptions.map((member) => <option key={member.user.id} value={member.user.id}>{member.user.fullName}</option>)}</select><button type="button" disabled={!newAdminId || submitting} onClick={() => void addAdmin()} className="rounded-sm bg-tertiary px-3 py-2 text-xs font-semibold text-on-tertiary disabled:opacity-50">Tambah</button></div></div></div></div>}
      <ConfirmModal isOpen={Boolean(removingAdmin)} title="Cabut Admin Biro" message={`Cabut penetapan ${removingAdmin?.name || "Admin Biro"} dari Biro ini?`} confirmLabel="Cabut penetapan" loading={submitting} onCancel={() => setRemovingAdmin(null)} onConfirm={() => void removeAdmin()} />
    </SimakinShell>
  );
}
