"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, ErrorState, LoadingState } from "@alfida/ui";
import { apiFetch } from "@/lib/api";
import { NotificationModal } from "@/components/notification-modal";
import { SiyaumAppShell } from "@/components/siyaum-app-shell";
import { getCurrentUser, hasSiyaumRole, type CurrentUser } from "@/lib/current-user";

interface Employee {
  id: string;
  fullName: string;
  email: string;
  unitId?: string | null;
  unitName?: string | null;
  isActive: boolean;
}

interface Member { id: string; userId: string; user?: Employee; }
interface Group {
  id: string;
  name: string;
  level?: string;
  unitId?: string | null;
  unitName?: string | null;
  pembina?: Employee | null;
  pembinaUserId?: string | null;
  groupAdmins?: Array<{ user: Employee; revokedAt?: string | null }>;
  members?: Member[];
  _count?: { members: number };
}

type Notice = { title: string; message: string; tone: "success" | "error" };
const emptyCreateForm = { name: "", level: "pra_tahsin", unitId: "" };

export function GroupStaffManager() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [participants, setParticipants] = useState<Employee[]>([]);
  const [groupId, setGroupId] = useState("");
  const [group, setGroup] = useState<Group | null>(null);
  const [candidateId, setCandidateId] = useState("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await getCurrentUser();
      const canManage = hasSiyaumRole(currentUser, "admin_ymq");
      const groupList = await apiFetch<Group[]>("/groups");
      const [employeeList, participantList] = canManage
        ? await Promise.all([
          apiFetch<Employee[]>("/ymq/employees/assignable"),
          apiFetch<Employee[]>("/ymq/roles/participants"),
        ])
        : [[], []];
      setUser(currentUser);
      setGroups(groupList);
      setEmployees(employeeList.filter((employee) => employee.isActive));
      setParticipants(participantList);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Data kelompok tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!groupId) {
      setGroup(null);
      return;
    }
    void apiFetch<Group>(`/groups/${groupId}`)
      .then(setGroup)
      .catch((reason) => setNotice({ title: "Kelompok tidak dapat dimuat", message: reason instanceof Error ? reason.message : "Silakan coba lagi.", tone: "error" }));
  }, [groupId]);

  const canManageGroups = hasSiyaumRole(user, "admin_ymq");
  const candidates = useMemo(
    () => employees.filter((employee) => `${employee.fullName} ${employee.email} ${employee.unitName || ""}`.toLowerCase().includes(search.toLowerCase())),
    [employees, search],
  );
  const units = useMemo(() => {
    const items = new Map<string, string>();
    employees.forEach((employee) => {
      if (employee.unitId && employee.unitName) items.set(employee.unitId, employee.unitName);
    });
    return [...items.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, "id"));
  }, [employees]);
  const selectedCandidate = employees.find((employee) => employee.id === candidateId);
  const isSelectedParticipant = participants.some((participant) => participant.id === candidateId);

  const mutate = async (action: "pembina" | "admin" | "member" | "remove-member", method: "PUT" | "POST" | "DELETE", userId?: string) => {
    if (!groupId || !userId) return;
    setSaving(true);
    try {
      const path = action === "pembina"
        ? `/groups/${groupId}/pembina`
        : action === "admin"
          ? `/groups/${groupId}/admins${method === "DELETE" ? `/${userId}` : ""}`
          : action === "member"
            ? "/groups/members"
            : `/groups/${groupId}/members/${userId}`;
      await apiFetch(path, {
        method,
        body: method === "DELETE" ? undefined : JSON.stringify(action === "member" ? { groupId, userId } : { userId }),
      });
      const refreshed = await apiFetch<Group>(`/groups/${groupId}`);
      setGroup(refreshed);
      setGroups((current) => current.map((item) => item.id === refreshed.id ? { ...item, ...refreshed } : item));
      setCandidateId("");
      setNotice({ title: "Penugasan diperbarui", message: "Status pembina, admin kelompok, atau roster telah diperbarui.", tone: "success" });
    } catch (reason) {
      setNotice({ title: "Perubahan belum tersimpan", message: reason instanceof Error ? reason.message : "Silakan coba lagi.", tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const createGroup = async (event: FormEvent) => {
    event.preventDefault();
    if (!createForm.name.trim() || !createForm.unitId) return;
    setSaving(true);
    try {
      const created = await apiFetch<Group>("/groups", {
        method: "POST",
        body: JSON.stringify({
          name: createForm.name.trim(),
          level: createForm.level,
          unitId: createForm.unitId,
        }),
      });
      setGroups((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name, "id")));
      setGroupId(created.id);
      setGroup(created);
      setCreateForm(emptyCreateForm);
      setCreateOpen(false);
      setNotice({ title: "Kelompok dibuat", message: "Kelompok YMQ baru siap diisi pembina, admin kelompok, dan roster peserta.", tone: "success" });
    } catch (reason) {
      setNotice({ title: "Kelompok belum dibuat", message: reason instanceof Error ? reason.message : "Silakan coba lagi.", tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const assignPembina = (event: FormEvent) => {
    event.preventDefault();
    void mutate("pembina", "PUT", candidateId);
  };

  const enrollParticipant = async () => {
    if (!candidateId) return;
    setSaving(true);
    try {
      await apiFetch("/ymq/roles/participants", { method: "POST", body: JSON.stringify({ userId: candidateId }) });
      setParticipants(await apiFetch<Employee[]>("/ymq/roles/participants"));
      setNotice({ title: "Peserta YMQ ditambahkan", message: "Peran peserta telah diberikan. Pengguna perlu login kembali agar klaim peran baru diterbitkan.", tone: "success" });
    } catch (reason) {
      setNotice({ title: "Peserta belum ditambahkan", message: reason instanceof Error ? reason.message : "Silakan coba lagi.", tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SiyaumAppShell user={user} active="groups">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Administrasi YMQ</p>
            <h1 className="mt-1 font-heading text-3xl font-bold">Kelompok & penugasan</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-primary/70">Kelola kelompok, pembina, admin kelompok, dan roster peserta. Otoritas selalu diverifikasi oleh API SIYAUM.</p>
          </div>
          {canManageGroups && <Button type="button" onClick={() => setCreateOpen(true)}><span className="material-symbols-rounded text-[18px]" aria-hidden="true">add</span>Buat Kelompok</Button>}
        </header>

        {loading ? <LoadingState message="Memuat kelompok dan proyeksi pegawai SIMPEG…" /> : error ? <ErrorState message={error} onRetry={load} /> : !canManageGroups ? (
          <EmptyState title="Akses administrasi tidak tersedia" description="Halaman ini dapat dibaca sesuai peran Anda, tetapi perubahan kelompok hanya tersedia bagi Admin YMQ atau Super Admin global." />
        ) : (
          <>
            <Card className="shadow-none">
              <label className="block text-sm font-semibold">Pilih kelompok
                <select value={groupId} onChange={(event) => setGroupId(event.target.value)} className="mt-2 block w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm">
                  <option value="">Pilih kelompok untuk dikelola</option>
                  {groups.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.unitName || "Unit belum tersedia"}</option>)}
                </select>
              </label>
            </Card>

            {group && <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
              <Card className="shadow-none">
                <h2 className="font-heading text-xl font-bold">{group.name}</h2>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-primary/60">Unit aktif</dt><dd className="font-medium">{group.unitName || "Belum tersedia"}</dd></div>
                  <div><dt className="text-primary/60">Level</dt><dd className="font-medium">{group.level?.replaceAll("_", " ") || "Belum tersedia"}</dd></div>
                  <div><dt className="text-primary/60">Pembina YMQ</dt><dd className="font-medium">{group.pembina?.fullName || "Belum ditugaskan"}</dd></div>
                  <div><dt className="text-primary/60">Peserta aktif</dt><dd className="font-medium">{group.members?.length || group._count?.members || 0}</dd></div>
                </dl>
                <div className="mt-6 border-t border-border pt-4"><h3 className="font-semibold">Admin Kelompok aktif</h3>{(group.groupAdmins || []).filter((assignment) => !assignment.revokedAt).length ? <ul className="mt-2 space-y-2">{group.groupAdmins?.filter((assignment) => !assignment.revokedAt).map((assignment) => <li key={assignment.user.id} className="flex items-center justify-between rounded-sm border border-border px-3 py-2 text-sm"><span>{assignment.user.fullName}<small className="ml-2 text-primary/60">{assignment.user.unitName}</small></span><Button type="button" size="sm" variant="danger" disabled={saving} onClick={() => void mutate("admin", "DELETE", assignment.user.id)}>Cabut</Button></li>)}</ul> : <p className="mt-2 text-sm text-primary/65">Belum ada admin kelompok aktif.</p>}</div>
                <div className="mt-6 border-t border-border pt-4"><h3 className="font-semibold">Roster aktif</h3>{group.members?.length ? <ul className="mt-2 space-y-2">{group.members.map((member) => <li key={member.id} className="flex items-center justify-between rounded-sm border border-border px-3 py-2 text-sm"><span>{member.user?.fullName || member.userId}<small className="ml-2 text-primary/60">{member.user?.unitName}</small></span><Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => void mutate("remove-member", "DELETE", member.userId)}>Pindahkan</Button></li>)}</ul> : <p className="mt-2 text-sm text-primary/65">Belum ada roster aktif.</p>}</div>
              </Card>
              <Card className="shadow-none">
                <h2 className="font-heading text-xl font-bold">Pilih pegawai aktif</h2>
                <p className="mt-1 text-sm text-primary/70">Pencarian bersumber dari proyeksi pegawai SIMPEG yang aktif.</p>
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="mt-4 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" placeholder="Cari nama, email, atau unit" />
                <select value={candidateId} onChange={(event) => setCandidateId(event.target.value)} className="mt-2 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Pilih pegawai</option>{candidates.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} — {employee.unitName || "Tanpa unit"}</option>)}</select>
                {selectedCandidate && <p className="mt-2 text-xs text-primary/65">{selectedCandidate.email} · Unit: {selectedCandidate.unitName || "Tanpa unit"} · Status: aktif</p>}
                <div className="mt-5 space-y-3 border-t border-border pt-4"><h3 className="font-semibold">Peserta YMQ</h3><p className="text-xs text-primary/65">Pembina, admin kelompok, dan roster hanya dapat ditetapkan setelah peran peserta aktif.</p><Button type="button" variant="secondary" disabled={saving || !candidateId || isSelectedParticipant} onClick={() => void enrollParticipant()}>{isSelectedParticipant ? "Sudah menjadi Peserta YMQ" : "Tambah Peserta YMQ"}</Button></div>
                <form onSubmit={assignPembina} className="mt-5 space-y-3 border-t border-border pt-4"><h3 className="font-semibold">Pembina YMQ</h3><Button type="submit" disabled={saving || !candidateId || !isSelectedParticipant}>Tetapkan / ganti Pembina</Button></form>
                <div className="mt-5 space-y-3 border-t border-border pt-4"><h3 className="font-semibold">Admin Kelompok</h3><Button type="button" variant="secondary" disabled={saving || !candidateId || !isSelectedParticipant} onClick={() => void mutate("admin", "POST", candidateId)}>Tambahkan Admin Kelompok</Button></div>
                <div className="mt-5 space-y-3 border-t border-border pt-4"><h3 className="font-semibold">Roster kelompok</h3><Button type="button" variant="outline" disabled={saving || !candidateId || !isSelectedParticipant} onClick={() => void mutate("member", "POST", candidateId)}>Tambahkan ke roster</Button></div>
              </Card>
            </div>}
          </>
        )}
      </div>

      {createOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="create-group-title">
        <form onSubmit={createGroup} className="w-full max-w-lg rounded-md border border-border bg-surface p-5">
          <div className="flex items-start justify-between border-b border-border pb-3"><div><h2 id="create-group-title" className="font-heading text-xl font-bold">Buat Kelompok YMQ</h2><p className="mt-1 text-sm text-primary/65">Kelompok baru dapat langsung diberi pembina dan roster setelah disimpan.</p></div><button type="button" onClick={() => setCreateOpen(false)} className="text-primary/65" aria-label="Tutup modal buat kelompok"><span className="material-symbols-rounded" aria-hidden="true">close</span></button></div>
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">Nama kelompok<input required value={createForm.name} onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" placeholder="Contoh: Halaqah SDIT A" /></label>
            <label className="block text-sm font-semibold">Unit<select required value={createForm.unitId} onChange={(event) => setCreateForm((current) => ({ ...current, unitId: event.target.value }))} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Pilih unit</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
            <label className="block text-sm font-semibold">Level<select value={createForm.level} onChange={(event) => setCreateForm((current) => ({ ...current, level: event.target.value }))} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="pra_tahsin">Pra Tahsin</option><option value="tahsin">Tahsin</option><option value="tahfiz">Tahfiz</option></select></label>
          </div>
          <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" disabled={saving} onClick={() => setCreateOpen(false)}>Batal</Button><Button type="submit" disabled={saving || !createForm.name.trim() || !createForm.unitId}>{saving ? "Menyimpan..." : "Simpan Kelompok"}</Button></div>
        </form>
      </div>}
      <NotificationModal open={Boolean(notice)} title={notice?.title || ""} message={notice?.message || ""} tone={notice?.tone} onClose={() => setNotice(null)} />
    </SiyaumAppShell>
  );
}
