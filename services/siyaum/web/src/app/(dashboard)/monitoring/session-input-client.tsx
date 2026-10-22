"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, ErrorState, LoadingState } from "@alfida/ui";
import { apiFetch } from "@/lib/api";
import { NotificationModal } from "@/components/notification-modal";
import { YmqProgressEvidenceUploader } from "@/components/ymq-progress-evidence-uploader";

interface Member { id: string; userId: string; user?: { fullName: string; unitName?: string | null }; fullName?: string; unitName?: string | null; }
interface Group { id: string; name: string; level: "pra_tahsin" | "tahsin" | "tahfiz"; unitName?: string | null; members?: Member[]; _count?: { members: number }; }
interface CurriculumUnit { id: string; iwrLevel: "iwr_1" | "iwr_2"; topicCode: string; topicTitle: string; pageStart: number; pageEnd: number; }
interface SavedProgress { id: string; memberId: string; }

const attendanceOptions = ["hadir", "izin", "sakit", "alpa"] as const;

export function SessionInputClient() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumUnit[]>([]);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<Record<string, { track: "pra_tahsin" | "tahsin" | "ziyadah"; iwrCurriculumUnitId: string; surahNumber: string; ayahStart: string; ayahEnd: string; note: string }>>({});
  const [savedProgress, setSavedProgress] = useState<SavedProgress[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string; tone: "success" | "error" } | null>(null);

  useEffect(() => {
    apiFetch<Group[]>("/groups").then(setGroups).catch((reason) => setError(reason.message)).finally(() => setLoadingGroups(false));
  }, []);

  useEffect(() => {
    if (!selectedGroupId) { setSelectedGroup(null); setAttendance({}); setProgress({}); return; }
    setLoadingRoster(true);
    setSavedProgress([]);
    apiFetch<Group>(`/groups/${selectedGroupId}`)
      .then((group) => {
        setSelectedGroup(group);
        const members = group.members || [];
        setAttendance(Object.fromEntries(members.map((member) => [member.id, "hadir"])));
        const track = group.level === "pra_tahsin" ? "pra_tahsin" : group.level === "tahfiz" ? "ziyadah" : "tahsin";
        setProgress(Object.fromEntries(members.map((member) => [member.id, { track, iwrCurriculumUnitId: "", surahNumber: "", ayahStart: "", ayahEnd: "", note: "" }])));
        return apiFetch<CurriculumUnit[]>("/curriculum/iwr");
      })
      .then(setCurriculum)
      .catch((reason) => setError(reason.message))
      .finally(() => setLoadingRoster(false));
  }, [selectedGroupId]);

  const members = selectedGroup?.members || [];
  const iwrUnits = useMemo(() => curriculum.filter((unit) => unit.iwrLevel === "iwr_1" || unit.iwrLevel === "iwr_2"), [curriculum]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedGroup) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        notes: notes || null,
        attendance: members.map((member) => ({ memberId: member.id, status: attendance[member.id] || "hadir", note: null })),
        progress: members.flatMap((member) => {
          const entry = progress[member.id];
          if (!entry) return [];
          const base = { memberId: member.id, track: entry.track, sequence: 1, note: entry.note || null };
          if (entry.track === "pra_tahsin") return entry.iwrCurriculumUnitId ? [{ ...base, iwrCurriculumUnitId: entry.iwrCurriculumUnitId, surahNumber: null, ayahStart: null, ayahEnd: null }] : [];
          if (!entry.surahNumber) return [];
          if (entry.track === "ziyadah") return [{ ...base, iwrCurriculumUnitId: null, surahNumber: Number(entry.surahNumber), ayahStart: null, ayahEnd: null }];
          return entry.ayahStart && entry.ayahEnd ? [{ ...base, iwrCurriculumUnitId: null, surahNumber: Number(entry.surahNumber), ayahStart: Number(entry.ayahStart), ayahEnd: Number(entry.ayahEnd) }] : [];
        }),
      };
      const response = await apiFetch<{ progress?: SavedProgress[] }>(`/learning-sessions/${selectedGroup.id}/${sessionDate}`, { method: "PUT", body: JSON.stringify(payload) });
      setSavedProgress(response.progress || []);
      setNotice({ title: "Sesi tersimpan", message: "Absensi dan progres kelompok telah dikirim sebagai satu catatan sesi.", tone: "success" });
    } catch (reason) {
      setNotice({ title: "Sesi belum tersimpan", message: reason instanceof Error ? reason.message : "Silakan periksa data lalu coba lagi.", tone: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingGroups) return <LoadingState message="Memuat kelompok yang menjadi kewenangan Anda…" />;
  if (error && !selectedGroupId) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-5">
      <Card className="shadow-none">
        <label className="block text-sm font-semibold text-primary" htmlFor="ymq-group">1. Pilih kelompok yang diampu</label>
        <p className="mt-1 text-sm text-primary/70">Daftar ini hanya berasal dari kelompok yang diizinkan API untuk akun Anda.</p>
        <select id="ymq-group" className="mt-3 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" value={selectedGroupId} onChange={(event) => setSelectedGroupId(event.target.value)}>
          <option value="">Pilih kelompok</option>
          {groups.map((group) => <option value={group.id} key={group.id}>{group.name} — {group.unitName || "Unit belum tersedia"}</option>)}
        </select>
      </Card>

      {!selectedGroupId ? <EmptyState title="Pilih kelompok terlebih dahulu" description="Roster aktif dan formulir sesi ditampilkan setelah kelompok dipilih." /> : loadingRoster ? <LoadingState message="Memuat roster aktif…" /> : selectedGroup ? (
        <form onSubmit={submit} className="space-y-5">
          <Card className="shadow-none">
            <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div><h2 className="font-heading text-xl font-bold">Input sesi {selectedGroup.name}</h2><p className="text-sm text-primary/70">Level: {selectedGroup.level.replaceAll("_", " ")}. Roster aktif: {members.length} peserta.</p></div>
              <label className="text-sm font-medium">Tanggal sesi<input type="date" required value={sessionDate} onChange={(event) => setSessionDate(event.target.value)} className="mt-1 block rounded-sm border border-border px-3 py-2" /></label>
            </div>
            <label className="mt-4 block text-sm font-medium">Catatan sesi<textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 block min-h-20 w-full rounded-sm border border-border px-3 py-2" placeholder="Catatan pembelajaran atau kendala kelompok" /></label>
          </Card>

          {members.map((member) => {
            const entry = progress[member.id];
            const displayName = member.user?.fullName || member.fullName || "Peserta";
            const saved = savedProgress.find((item) => item.memberId === member.id);
            return <Card key={member.id} className="shadow-none"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h3 className="font-heading text-lg font-bold">{displayName}</h3><p className="text-xs text-primary/65">{member.user?.unitName || member.unitName || "Unit belum tersedia"}</p></div><label className="text-sm font-medium">Kehadiran<select value={attendance[member.id] || "hadir"} onChange={(event) => setAttendance((current) => ({ ...current, [member.id]: event.target.value }))} className="ml-2 rounded-sm border border-border px-2 py-1"><option value="hadir">Hadir</option>{attendanceOptions.slice(1).map((status) => <option key={status} value={status}>{status}</option>)}</select></label></div>
              {entry && <div className="mt-4 grid gap-3 border-t border-border pt-4 md:grid-cols-2"><label className="text-sm font-medium">Jalur<select value={entry.track} onChange={(event) => setProgress((current) => ({ ...current, [member.id]: { ...entry, track: event.target.value as typeof entry.track, iwrCurriculumUnitId: "", surahNumber: "", ayahStart: "", ayahEnd: "" } }))} className="mt-1 block w-full rounded-sm border border-border px-3 py-2"><option value="pra_tahsin">Pra Tahsin — IWR 1/IWR 2</option>{selectedGroup.level !== "pra_tahsin" && <option value="tahsin">Tahsin — surah dan ayah</option>}{selectedGroup.level !== "pra_tahsin" && <option value="ziyadah">Ziyadah — surah saja</option>}</select></label>
              {entry.track === "pra_tahsin" ? <label className="text-sm font-medium">Unit IWR<select value={entry.iwrCurriculumUnitId} onChange={(event) => setProgress((current) => ({ ...current, [member.id]: { ...entry, iwrCurriculumUnitId: event.target.value } }))} className="mt-1 block w-full rounded-sm border border-border px-3 py-2"><option value="">Pilih topik IWR 1/IWR 2</option>{iwrUnits.map((unit) => <option value={unit.id} key={unit.id}>{unit.iwrLevel === "iwr_1" ? "IWR 1" : "IWR 2"} · {unit.topicCode} — hlm. {unit.pageStart}-{unit.pageEnd}</option>)}</select></label> : <><label className="text-sm font-medium">Nomor surah<input type="number" min="1" max="114" value={entry.surahNumber} onChange={(event) => setProgress((current) => ({ ...current, [member.id]: { ...entry, surahNumber: event.target.value } }))} className="mt-1 block w-full rounded-sm border border-border px-3 py-2" /></label>{entry.track === "tahsin" && <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Ayat mulai<input type="number" min="1" value={entry.ayahStart} onChange={(event) => setProgress((current) => ({ ...current, [member.id]: { ...entry, ayahStart: event.target.value } }))} className="mt-1 block w-full rounded-sm border border-border px-3 py-2" /></label><label className="text-sm font-medium">Ayat selesai<input type="number" min="1" value={entry.ayahEnd} onChange={(event) => setProgress((current) => ({ ...current, [member.id]: { ...entry, ayahEnd: event.target.value } }))} className="mt-1 block w-full rounded-sm border border-border px-3 py-2" /></label></div>}</>}
              <label className="text-sm font-medium md:col-span-2">Catatan progres<textarea value={entry.note} onChange={(event) => setProgress((current) => ({ ...current, [member.id]: { ...entry, note: event.target.value } }))} className="mt-1 block min-h-16 w-full rounded-sm border border-border px-3 py-2" /></label></div>}
              {saved && <div className="mt-4"><YmqProgressEvidenceUploader progressId={saved.id} groupId={selectedGroup.id} sessionId={`${selectedGroup.id}-${sessionDate}`} disabled={isSaving} /></div>}
            </Card>;
          })}
          <div className="flex justify-end"><Button type="submit" loading={isSaving} disabled={isSaving || !selectedGroupId}>Simpan sesi dan progres</Button></div>
        </form>
      ) : null}
      <NotificationModal open={Boolean(notice)} title={notice?.title || ""} message={notice?.message || ""} tone={notice?.tone} onClose={() => setNotice(null)} />
    </div>
  );
}
