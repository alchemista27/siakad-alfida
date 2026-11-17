"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, ErrorState, LoadingState } from "@alfida/ui";
import { NotificationModal } from "@/components/notification-modal";
import { SiyaumAppShell } from "@/components/siyaum-app-shell";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, hasSiyaumRole, type CurrentUser } from "@/lib/current-user";

interface Group {
  id: string;
  name: string;
  unitName?: string | null;
  level?: string | null;
}

interface GroupMember {
  id: string;
  userId: string;
  user?: { id: string; fullName: string; email: string; unitName?: string | null; isActive: boolean } | null;
}

interface GroupAdminAssignment {
  userId: string;
  revokedAt?: string | null;
  user?: { id: string; fullName: string; email: string; unitName?: string | null } | null;
}

interface GroupDetail extends Group {
  members: GroupMember[];
  groupAdmins: GroupAdminAssignment[];
}

type Notice = { title: string; message: string; tone: "success" | "error" };

export function GroupAdminAssignmentManager() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<GroupDetail | null>(null);
  const [candidateId, setCandidateId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const loadGroups = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (!hasSiyaumRole(currentUser, "admin_ymq")) return;
    setGroups(await apiFetch<Group[]>("/groups"));
  };

  const loadGroup = async (id: string) => {
    const detail = await apiFetch<GroupDetail>(`/groups/${id}`);
    setSelectedGroup(detail);
  };

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        await loadGroups();
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Daftar kelompok tidak dapat dimuat.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setCandidateId("");
    if (!groupId) {
      setSelectedGroup(null);
      return;
    }
    void loadGroup(groupId).catch((reason) => setNotice({
      title: "Kelompok tidak dapat dimuat",
      message: reason instanceof Error ? reason.message : "Silakan coba lagi.",
      tone: "error",
    }));
  }, [groupId]);

  const canManage = hasSiyaumRole(user, "admin_ymq");
  const eligibleMembers = useMemo(
    () => (selectedGroup?.members || []).filter((member) => member.user?.isActive),
    [selectedGroup],
  );
  const activeAssignments = useMemo(
    () => (selectedGroup?.groupAdmins || []).filter((assignment) => !assignment.revokedAt),
    [selectedGroup],
  );
  const alreadyAssigned = activeAssignments.some((assignment) => assignment.userId === candidateId);

  const assign = async () => {
    if (!groupId || !candidateId || alreadyAssigned) return;
    setSaving(true);
    try {
      await apiFetch(`/groups/${groupId}/admins`, { method: "POST", body: JSON.stringify({ userId: candidateId }) });
      await loadGroup(groupId);
      setCandidateId("");
      setNotice({ title: "Admin Kelompok ditetapkan", message: "Penugasan disimpan untuk anggota roster aktif yang dipilih.", tone: "success" });
    } catch (reason) {
      setNotice({ title: "Penugasan belum tersimpan", message: reason instanceof Error ? reason.message : "Silakan coba lagi.", tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (userId: string) => {
    if (!groupId) return;
    setSaving(true);
    try {
      await apiFetch(`/groups/${groupId}/admins/${userId}`, { method: "DELETE" });
      await loadGroup(groupId);
      setNotice({ title: "Admin Kelompok dicabut", message: "Penugasan aktif telah dicabut.", tone: "success" });
    } catch (reason) {
      setNotice({ title: "Penugasan belum dicabut", message: reason instanceof Error ? reason.message : "Silakan coba lagi.", tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SiyaumAppShell user={user} active="group-admins">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Administrasi YMQ</p>
          <h1 className="mt-1 font-heading text-3xl font-bold">Penugasan Admin Kelompok</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-primary/70">Hanya anggota roster aktif kelompok yang sama dapat ditunjuk sebagai Admin Kelompok. Kelola roster terlebih dahulu dari menu Kelompok & roster.</p>
        </header>
        {loading ? <LoadingState message="Memuat kelompok YMQ…" /> : error ? <ErrorState message={error} onRetry={() => void loadGroups()} /> : !canManage ? (
          <EmptyState title="Akses penugasan tidak tersedia" description="Penugasan Admin Kelompok hanya tersedia bagi Admin YMQ atau Super Admin global." />
        ) : groups.length === 0 ? <EmptyState title="Belum ada kelompok" description="Buat kelompok dan roster peserta terlebih dahulu." /> : <>
          <Card className="shadow-none">
            <label className="block text-sm font-semibold">Pilih kelompok<select aria-label="Pilih kelompok" value={groupId} onChange={(event) => setGroupId(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Pilih kelompok</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}{group.unitName ? ` — ${group.unitName}` : ""}</option>)}</select></label>
          </Card>
          {selectedGroup ? <div className="grid gap-5 lg:grid-cols-[1fr_.9fr]">
            <Card className="shadow-none">
              <h2 className="font-heading text-xl font-bold">{selectedGroup.name}</h2>
              <p className="mt-1 text-sm text-primary/65">{selectedGroup.unitName || "Unit belum tersedia"} · {selectedGroup.level?.replaceAll("_", " ") || "Level belum ditetapkan"}</p>
              <div className="mt-5 border-t border-border pt-4"><h3 className="font-semibold">Admin Kelompok aktif</h3>{activeAssignments.length ? <ul className="mt-3 space-y-2">{activeAssignments.map((assignment) => <li key={assignment.user?.id ?? assignment.userId} className="flex items-center justify-between gap-3 rounded-sm border border-border px-3 py-2 text-sm"><span><span className="block font-medium">{assignment.user?.fullName || "Pegawai tidak tersedia"}</span><small className="text-primary/60">{assignment.user?.unitName || "Unit tidak tersedia"}</small></span><Button type="button" size="sm" variant="danger" disabled={saving} onClick={() => void revoke(assignment.userId)}>Cabut</Button></li>)}</ul> : <p className="mt-2 text-sm text-primary/65">Belum ada Admin Kelompok aktif.</p>}</div>
            </Card>
            <Card className="shadow-none">
              <h2 className="font-heading text-xl font-bold">Pilih anggota roster aktif</h2>
              <p className="mt-1 text-sm text-primary/65">Daftar ini tidak mengambil pegawai dari luar kelompok.</p>
              <select aria-label="Pilih anggota roster aktif" value={candidateId} onChange={(event) => setCandidateId(event.target.value)} className="mt-4 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Pilih anggota roster aktif</option>{eligibleMembers.map((member) => <option key={member.userId} value={member.userId}>{member.user?.fullName || member.userId}{member.user?.unitName ? ` — ${member.user.unitName}` : ""}</option>)}</select>
              {!eligibleMembers.length ? <p className="mt-3 text-sm leading-6 text-primary/65">Belum ada anggota roster aktif yang dapat ditunjuk.</p> : null}
              {alreadyAssigned ? <p className="mt-3 text-sm leading-6 text-primary/65">Anggota ini sudah menjadi Admin Kelompok aktif.</p> : null}
              <Button type="button" className="mt-5" disabled={saving || !candidateId || alreadyAssigned} onClick={() => void assign()}>{saving ? "Menyimpan…" : "Tetapkan Admin Kelompok"}</Button>
            </Card>
          </div> : null}
        </>}
      </div>
      <NotificationModal open={Boolean(notice)} title={notice?.title || ""} message={notice?.message || ""} tone={notice?.tone} onClose={() => setNotice(null)} />
    </SiyaumAppShell>
  );
}
