"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, ErrorState, LoadingState } from "@alfida/ui";
import { NotificationModal } from "@/components/notification-modal";
import { SiyaumAppShell } from "@/components/siyaum-app-shell";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, hasSiyaumRole, type CurrentUser } from "@/lib/current-user";

interface Employee {
  id: string;
  fullName: string;
  email: string;
  unitId?: string | null;
  unitName?: string | null;
  isActive: boolean;
}

interface Group {
  id: string;
  name: string;
  level?: string | null;
  unitId?: string | null;
  unitName?: string | null;
  pembinaUserId?: string | null;
  pembina?: Employee | null;
}

type Notice = { title: string; message: string; tone: "success" | "error" };

export function PembinaAssignmentManager() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [participants, setParticipants] = useState<Employee[]>([]);
  const [groupId, setGroupId] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const canManage = hasSiyaumRole(user, "admin_ymq");
  const selectedGroup = groups.find((group) => group.id === groupId) || null;
  const selectedCandidate = employees.find((employee) => employee.id === candidateId) || null;
  const isSelectedParticipant = participants.some((participant) => participant.id === candidateId);
  const candidates = useMemo(
    () => employees.filter((employee) => `${employee.fullName} ${employee.email} ${employee.unitName || ""}`.toLowerCase().includes(search.toLowerCase())),
    [employees, search],
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await getCurrentUser();
      const groupList = await apiFetch<Group[]>("/groups");
      const [employeeList, participantList] = hasSiyaumRole(currentUser, "admin_ymq")
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
      setError(reason instanceof Error ? reason.message : "Data penugasan pembina tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const refreshGroup = async (id: string) => {
    const refreshed = await apiFetch<Group>(`/groups/${id}`);
    setGroups((current) => current.map((group) => group.id === refreshed.id ? { ...group, ...refreshed } : group));
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

  const assign = async (event: FormEvent) => {
    event.preventDefault();
    if (!groupId || !candidateId || !isSelectedParticipant) return;
    setSaving(true);
    try {
      await apiFetch(`/groups/${groupId}/pembina`, { method: "PUT", body: JSON.stringify({ userId: candidateId }) });
      await refreshGroup(groupId);
      setCandidateId("");
      setNotice({ title: "Pembina ditetapkan", message: "Penugasan pembina kelompok telah diperbarui.", tone: "success" });
    } catch (reason) {
      setNotice({ title: "Pembina belum ditetapkan", message: reason instanceof Error ? reason.message : "Silakan coba lagi.", tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const revoke = async () => {
    if (!groupId) return;
    setSaving(true);
    try {
      await apiFetch(`/groups/${groupId}/pembina`, { method: "DELETE" });
      await refreshGroup(groupId);
      setNotice({ title: "Pembina dicabut", message: "Kelompok tidak lagi memiliki pembina aktif.", tone: "success" });
    } catch (reason) {
      setNotice({ title: "Pembina belum dicabut", message: reason instanceof Error ? reason.message : "Silakan coba lagi.", tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SiyaumAppShell user={user} active="pembina">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Administrasi YMQ</p>
          <h1 className="mt-1 font-heading text-3xl font-bold">Penugasan Pembina</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-primary/70">Tetapkan satu pembina aktif untuk setiap kelompok. Roster dan admin kelompok dikelola terpisah pada menu Kelompok & roster.</p>
        </header>
        {loading ? <LoadingState message="Memuat kelompok dan pegawai aktif…" /> : error ? <ErrorState message={error} onRetry={load} /> : !canManage ? (
          <EmptyState title="Akses administrasi tidak tersedia" description="Penugasan pembina hanya dapat dikelola oleh Admin YMQ." />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
            <Card className="shadow-none">
              <h2 className="font-heading text-xl font-bold">Kelompok</h2>
              <p className="mt-1 text-sm text-primary/70">Pilih kelompok yang akan diberi atau diganti pembinanya.</p>
              <select value={groupId} onChange={(event) => setGroupId(event.target.value)} className="mt-4 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm">
                <option value="">Pilih kelompok</option>
                {groups.map((group) => <option key={group.id} value={group.id}>{group.name} — {group.unitName || "Unit belum tersedia"}</option>)}
              </select>
              {selectedGroup ? <dl className="mt-5 grid gap-3 rounded-md border border-border bg-neutral/40 p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-primary/60">Unit</dt><dd className="font-medium">{selectedGroup.unitName || "—"}</dd></div>
                <div><dt className="text-primary/60">Level</dt><dd className="font-medium">{selectedGroup.level?.replaceAll("_", " ") || "—"}</dd></div>
                <div className="sm:col-span-2"><dt className="text-primary/60">Pembina saat ini</dt><dd className="font-medium">{selectedGroup.pembina?.fullName || "Belum ditugaskan"}</dd></div>
              </dl> : <EmptyState title="Pilih kelompok" description="Detail dan tindakan pembina tampil setelah kelompok dipilih." />}
              {selectedGroup?.pembinaUserId ? <Button type="button" variant="danger" disabled={saving} className="mt-4" onClick={() => void revoke()}>Cabut Pembina</Button> : null}
            </Card>
            <Card className="shadow-none">
              <h2 className="font-heading text-xl font-bold">Tetapkan Pembina</h2>
              <p className="mt-1 text-sm text-primary/70">Calon diambil dari pegawai aktif proyeksi SIMPEG dan wajib telah menjadi Peserta YMQ.</p>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="mt-4 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" placeholder="Cari nama, email, atau unit" />
              <select value={candidateId} onChange={(event) => setCandidateId(event.target.value)} className="mt-2 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm">
                <option value="">Pilih pegawai aktif</option>
                {candidates.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} — {employee.unitName || "Tanpa unit"}</option>)}
              </select>
              {selectedCandidate ? <p className="mt-2 text-xs text-primary/65">{selectedCandidate.email} · Unit: {selectedCandidate.unitName || "Tanpa unit"} · Peserta YMQ: {isSelectedParticipant ? "aktif" : "belum aktif"}</p> : null}
              {!isSelectedParticipant && candidateId ? <div className="mt-4 border-t border-border pt-4"><p className="text-xs leading-5 text-primary/65">Tambahkan sebagai Peserta YMQ terlebih dahulu sebelum menetapkan pembina.</p><Button type="button" variant="secondary" className="mt-3" disabled={saving} onClick={() => void enrollParticipant()}>Tambah Peserta YMQ</Button></div> : null}
              <form onSubmit={assign} className="mt-5 border-t border-border pt-4"><Button type="submit" disabled={saving || !selectedGroup || !candidateId || !isSelectedParticipant}>{selectedGroup?.pembinaUserId ? "Ganti Pembina" : "Tetapkan Pembina"}</Button></form>
            </Card>
          </div>
        )}
      </div>
      <NotificationModal open={Boolean(notice)} title={notice?.title || ""} message={notice?.message || ""} tone={notice?.tone} onClose={() => setNotice(null)} />
    </SiyaumAppShell>
  );
}
