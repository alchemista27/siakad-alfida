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

interface Member {
  id: string;
  userId: string;
  progressLevel?: "pra_tahsin" | "tahsin" | "tahfiz" | null;
  user?: Employee;
}

interface Group {
  id: string;
  name: string;
  level?: string;
  unitId?: string | null;
  unitName?: string | null;

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
    employees.forEach((employee) => { if (employee.unitId && employee.unitName) items.set(employee.unitId, employee.unitName); });
    return [...items.entries()].map(([id, name]) => ({ id, name })).sort((left, right) => left.name.localeCompare(right.name, "id"));
  }, [employees]);
  const groupsByUnit = useMemo(() => {
    const mapping = new Map<string, { unitName: string; groups: Group[] }>();
    groups.forEach((item) => {
      const key = item.unitId || item.unitName || "unassigned";
      const current = mapping.get(key) || { unitName: item.unitName || "Unit belum tersedia", groups: [] };
      current.groups.push(item);
      mapping.set(key, current);
    });
    return [...mapping.entries()]
      .map(([id, value]) => ({ id, ...value, groups: value.groups.sort((left, right) => left.name.localeCompare(right.name, "id")) }))
      .sort((left, right) => left.unitName.localeCompare(right.unitName, "id"));
  }, [groups]);
  const selectedCandidate = employees.find((employee) => employee.id === candidateId);
  const isSelectedParticipant = participants.some((participant) => participant.id === candidateId);
  const mutateRoster = async (method: "POST" | "DELETE", userId: string) => {
    if (!groupId) return;
    setSaving(true);
    try {
      const path = method === "POST" ? "/groups/members" : `/groups/${groupId}/members/${userId}`;
      await apiFetch(path, {
        method,
        body: method === "POST" ? JSON.stringify({ groupId, userId }) : undefined,
      });
      const refreshed = await apiFetch<Group>(`/groups/${groupId}`);
      setGroup(refreshed);
      setGroups((current) => current.map((item) => item.id === refreshed.id ? { ...item, ...refreshed } : item));
      setCandidateId("");
      setNotice({ title: "Roster diperbarui", message: "Roster peserta aktif telah diperbarui.", tone: "success" });
    } catch (reason) {
      setNotice({ title: "Roster belum diperbarui", message: reason instanceof Error ? reason.message : "Silakan coba lagi.", tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const createGroup = async (event: FormEvent) => {
    event.preventDefault();
    if (!createForm.name.trim() || !createForm.unitId) return;
    setSaving(true);
    try {
      const created = await apiFetch<Group>("/groups", { method: "POST", body: JSON.stringify({ name: createForm.name.trim(), level: createForm.level, unitId: createForm.unitId }) });
      setGroups((current) => [...current, created].sort((left, right) => left.name.localeCompare(right.name, "id")));
      setGroupId(created.id);
      setGroup(created);
      setCreateForm(emptyCreateForm);
      setCreateOpen(false);
      setNotice({ title: "Kelompok dibuat", message: "Kelompok baru siap diisi roster peserta.", tone: "success" });
    } catch (reason) {
      setNotice({ title: "Kelompok belum dibuat", message: reason instanceof Error ? reason.message : "Silakan coba lagi.", tone: "error" });
    } finally {
      setSaving(false);
    }
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
            <h1 className="mt-1 font-heading text-3xl font-bold">Kelompok & roster</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-primary/70">Kelola kelompok dan roster peserta. Penugasan Admin Kelompok, Pembina, dan Penguji tersedia di menu terpisah.</p>
          </div>
          {canManageGroups ? <Button type="button" onClick={() => setCreateOpen(true)}><span className="material-symbols-rounded text-[18px]" aria-hidden="true">add</span>Buat Kelompok</Button> : null}
        </header>
        {loading ? <LoadingState message="Memuat kelompok dan proyeksi pegawai SIMPEG…" /> : error ? <ErrorState message={error} onRetry={load} /> : !canManageGroups ? (
          <EmptyState title="Akses administrasi tidak tersedia" description="Perubahan kelompok hanya tersedia bagi Admin YMQ atau Super Admin global." />
        ) : <>
          <Card className="shadow-none">
            <p className="text-sm font-semibold">Daftar kelompok</p>
            <p className="mt-1 text-sm text-primary/65">Pilih unit, kemudian kelompok untuk mengelola roster peserta.</p>
            <div className="mt-4 space-y-5">{groupsByUnit.map((unit) => <section key={unit.id} className="border-l-2 border-tertiary/30 pl-4"><h2 className="font-heading text-lg font-bold">{unit.unitName}</h2><div className="mt-2 flex flex-wrap gap-2">{unit.groups.map((item) => <Button key={item.id} type="button" size="sm" variant={item.id === groupId ? "secondary" : "outline"} onClick={() => setGroupId(item.id)}>{item.name}</Button>)}</div></section>)}</div>
          </Card>
          {group ? <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <Card className="shadow-none">
              <h2 className="font-heading text-xl font-bold">{group.name}</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-primary/60">Unit aktif</dt><dd className="font-medium">{group.unitName || "Belum tersedia"}</dd></div><div><dt className="text-primary/60">Level</dt><dd className="font-medium">{group.level?.replaceAll("_", " ") || "Belum ditetapkan"}</dd></div><div><dt className="text-primary/60">Peserta aktif</dt><dd className="font-medium">{group.members?.length || group._count?.members || 0}</dd></div></dl>
              <div className="mt-6 border-t border-border pt-4"><h3 className="font-semibold">Roster aktif</h3>{group.members?.length ? <ul className="mt-2 space-y-2">{group.members.map((member) => <li key={member.id} className="flex items-center justify-between rounded-sm border border-border px-3 py-2 text-sm"><span>{member.user?.fullName || member.userId}<small className="ml-2 text-primary/60">{member.user?.unitName || "Unit tidak tersedia"}</small><small className="ml-2 text-primary/60">Progress: {member.progressLevel?.replaceAll("_", " ") || "Belum ditetapkan"}</small></span><Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => void mutateRoster("DELETE", member.userId)}>Pindahkan</Button></li>)}</ul> : <p className="mt-2 text-sm text-primary/65">Belum ada roster aktif.</p>}</div>
            </Card>
            <Card className="shadow-none">
              <h2 className="font-heading text-xl font-bold">Pilih pegawai aktif</h2>
              <p className="mt-1 text-sm text-primary/70">Pencarian bersumber dari proyeksi pegawai SIMPEG yang aktif.</p>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="mt-4 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" placeholder="Cari nama, email, atau unit" />
              <select value={candidateId} onChange={(event) => setCandidateId(event.target.value)} className="mt-2 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Pilih pegawai</option>{candidates.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} — {employee.unitName || "Tanpa unit"}</option>)}</select>
              {selectedCandidate ? <p className="mt-2 text-xs text-primary/65">{selectedCandidate.email} · Unit: {selectedCandidate.unitName || "Tanpa unit"} · Status: aktif</p> : null}
              {candidateId ? <p className="mt-1 text-xs text-primary/65" aria-live="polite">Status Peserta YMQ: {isSelectedParticipant ? "aktif" : "belum aktif"}</p> : null}
              <div className="mt-5 space-y-3 border-t border-border pt-4"><h3 className="font-semibold">Peserta YMQ</h3><p className="text-xs text-primary/65">Roster kelompok hanya dapat ditetapkan setelah peran Peserta YMQ aktif.</p><Button type="button" variant="secondary" disabled={saving || !candidateId || isSelectedParticipant} onClick={() => void enrollParticipant()}>{isSelectedParticipant ? "Sudah menjadi Peserta YMQ" : "Tambah Peserta YMQ"}</Button></div>
              <div className="mt-5 space-y-3 border-t border-border pt-4"><h3 className="font-semibold">Roster kelompok</h3><Button type="button" variant="outline" disabled={saving || !candidateId || !isSelectedParticipant} onClick={() => void mutateRoster("POST", candidateId)}>{!candidateId ? "Pilih pegawai terlebih dahulu" : !isSelectedParticipant ? "Aktifkan Peserta YMQ terlebih dahulu" : "Tambahkan ke roster"}</Button></div>
            </Card>
          </div> : null}
        </>}
      </div>
      {createOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="create-group-title"><form onSubmit={createGroup} className="w-full max-w-lg rounded-md border border-border bg-surface p-5"><div className="flex items-start justify-between border-b border-border pb-3"><div><h2 id="create-group-title" className="font-heading text-xl font-bold">Buat Kelompok YMQ</h2><p className="mt-1 text-sm text-primary/65">Kelompok baru dapat diberi roster setelah disimpan.</p></div><button type="button" onClick={() => setCreateOpen(false)} className="text-primary/65" aria-label="Tutup modal buat kelompok"><span className="material-symbols-rounded" aria-hidden="true">close</span></button></div><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Nama kelompok<input required value={createForm.name} onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" placeholder="Contoh: Halaqah SDIT A" /></label><label className="block text-sm font-semibold">Unit<select required value={createForm.unitId} onChange={(event) => setCreateForm((current) => ({ ...current, unitId: event.target.value }))} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Pilih unit</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label><label className="block text-sm font-semibold">Level<select value={createForm.level} onChange={(event) => setCreateForm((current) => ({ ...current, level: event.target.value }))} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="pra_tahsin">Pra Tahsin</option><option value="tahsin">Tahsin</option><option value="tahfiz">Tahfiz</option></select></label></div><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" disabled={saving} onClick={() => setCreateOpen(false)}>Batal</Button><Button type="submit" disabled={saving || !createForm.name.trim() || !createForm.unitId}>{saving ? "Menyimpan..." : "Simpan Kelompok"}</Button></div></form></div> : null}
      <NotificationModal open={Boolean(notice)} title={notice?.title || ""} message={notice?.message || ""} tone={notice?.tone} onClose={() => setNotice(null)} />
    </SiyaumAppShell>
  );
}
