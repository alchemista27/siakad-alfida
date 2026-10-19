"use client";

import { FormEvent, useState } from "react";
import { siakadApiFetch } from "@/lib/api";

type Roster = { id: string; student?: { fullName?: string } | null };
type Grade = { enrollmentId: string; category: string; label: string; score: number; feedback?: string | null };
type GradeResponse = { roster: Roster[]; grades: Grade[] };
type Journal = { id: string; date: string; topic: string; notes?: string | null; studentCountPresent: number; studentCountAbsent: number };
type GradeDraft = { enrollmentId: string; studentName: string; score: string; feedback: string };

export default function TeacherGradesPage() {
  const [assignmentId, setAssignmentId] = useState("");
  const [category, setCategory] = useState("daily");
  const [label, setLabel] = useState("Kuis 1");
  const [grades, setGrades] = useState<GradeDraft[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [journalDate, setJournalDate] = useState(new Date().toISOString().slice(0, 10));
  const [journalTopic, setJournalTopic] = useState("");
  const [journalNotes, setJournalNotes] = useState("");

  async function loadAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assignmentId.trim()) {
      setError("ID penugasan wajib diisi.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const id = assignmentId.trim();
      const [grid, journalRows] = await Promise.all([
        siakadApiFetch<GradeResponse>(`/teaching/assignments/${id}/grades`),
        siakadApiFetch<Journal[]>(`/teaching/assignments/${id}/journals`),
      ]);
      const gradeByEnrollment = new Map(grid.grades.filter((grade) => grade.category === category && grade.label === label).map((grade) => [grade.enrollmentId, grade]));
      setGrades(grid.roster.map((enrollment) => {
        const grade = gradeByEnrollment.get(enrollment.id);
        return { enrollmentId: enrollment.id, studentName: enrollment.student?.fullName || "Siswa tanpa nama", score: grade ? String(grade.score) : "", feedback: grade?.feedback || "" };
      }));
      setJournals(journalRows);
      setLoaded(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal memuat grid nilai dan jurnal.");
      setGrades([]);
      setJournals([]);
      setLoaded(false);
    } finally {
      setLoading(false);
    }
  }

  function updateGrade(enrollmentId: string, patch: Partial<GradeDraft>) {
    setGrades((current) => current.map((grade) => grade.enrollmentId === enrollmentId ? { ...grade, ...patch } : grade));
  }

  async function saveGrades() {
    const id = assignmentId.trim();
    if (!id || !label.trim()) {
      setError("Label penilaian wajib diisi.");
      return;
    }
    const items = grades.filter((grade) => grade.score.trim() !== "").map((grade) => ({ ...grade, score: Number(grade.score) }));
    if (items.some((grade) => !Number.isFinite(grade.score) || grade.score < 0 || grade.score > 100)) {
      setError("Setiap nilai harus berupa angka antara 0 dan 100.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await siakadApiFetch(`/teaching/assignments/${id}/grades/batch`, { method: "PUT", body: JSON.stringify({ items: items.map(({ enrollmentId, score, feedback }) => ({ enrollmentId, category, label: label.trim(), score, feedback: feedback || undefined })) }) });
      setSuccess("Nilai berhasil disimpan.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal menyimpan nilai.");
    } finally {
      setSaving(false);
    }
  }

  async function addJournal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assignmentId.trim() || !journalTopic.trim()) {
      setError("ID penugasan dan topik jurnal wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await siakadApiFetch<Journal>(`/teaching/assignments/${assignmentId.trim()}/journals`, { method: "POST", body: JSON.stringify({ date: journalDate, topic: journalTopic.trim(), notes: journalNotes || undefined }) });
      setJournals((current) => [created, ...current]);
      setJournalTopic("");
      setJournalNotes("");
      setSuccess("Jurnal mengajar berhasil ditambahkan.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal menambahkan jurnal.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 p-5 md:p-8">
      <header><p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0f7f6d]">Ruang guru</p><h1 className="mt-2 text-3xl font-semibold">Grid nilai dan jurnal</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#454545]/75">Masukkan ID penugasan milik Anda. Server membatasi roster, nilai, dan jurnal pada penugasan yang sah.</p></header>
      <form onSubmit={loadAssignment} className="grid gap-4 rounded-lg border border-[#E3E8E7] bg-white p-5 md:grid-cols-[1fr_150px_1fr_auto] md:items-end">
        <label className="grid gap-2 text-sm font-medium">ID penugasan<input value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" placeholder="UUID penugasan" /></label>
        <label className="grid gap-2 text-sm font-medium">Kategori<select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-sm border border-[#E3E8E7] bg-white px-3 py-2"><option value="daily">Harian</option><option value="mid">PTS</option><option value="final">PAS</option><option value="project">Proyek</option></select></label>
        <label className="grid gap-2 text-sm font-medium">Label<input value={label} onChange={(event) => setLabel(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" /></label>
        <button type="submit" disabled={loading} className="rounded-sm bg-[#0f7f6d] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Memuat…" : "Muat penugasan"}</button>
      </form>
      {error && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {success && <p role="status" className="rounded-sm border border-[#b9dfd8] bg-[#e6f4f1] p-3 text-sm text-[#0f7f6d]">{success}</p>}
      {loading && <p className="text-sm text-[#454545]/70">Memuat grid nilai dan jurnal…</p>}
      {loaded && !loading && grades.length === 0 && <p className="rounded-lg border border-[#E3E8E7] bg-white p-5 text-sm text-[#454545]/75">Belum ada siswa aktif pada penugasan ini.</p>}
      {grades.length > 0 && <section className="overflow-hidden rounded-lg border border-[#E3E8E7] bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E3E8E7] p-4"><h2 className="text-lg font-semibold">Grid nilai</h2><button type="button" onClick={saveGrades} disabled={saving} className="rounded-sm bg-[#0f7f6d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Menyimpan…" : "Simpan nilai"}</button></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#F7F8F8] text-xs uppercase tracking-wide text-[#454545]/65"><tr><th className="p-3">Siswa</th><th className="p-3">Nilai</th><th className="p-3">Umpan balik</th></tr></thead><tbody>{grades.map((grade) => <tr key={grade.enrollmentId} className="border-t border-[#E3E8E7]"><td className="p-3 font-medium">{grade.studentName}</td><td className="p-3"><input inputMode="decimal" value={grade.score} onChange={(event) => updateGrade(grade.enrollmentId, { score: event.target.value })} className="w-28 rounded-sm border border-[#E3E8E7] px-2 py-1.5" placeholder="0–100" /></td><td className="p-3"><input value={grade.feedback} onChange={(event) => updateGrade(grade.enrollmentId, { feedback: event.target.value })} className="w-full rounded-sm border border-[#E3E8E7] px-2 py-1.5" placeholder="Opsional" /></td></tr>)}</tbody></table></div></section>}
      <section className="rounded-lg border border-[#E3E8E7] bg-white p-5"><h2 className="text-lg font-semibold">Jurnal mengajar</h2><form onSubmit={addJournal} className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto]"><input type="date" value={journalDate} onChange={(event) => setJournalDate(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" /><input value={journalTopic} onChange={(event) => setJournalTopic(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" placeholder="Topik pembelajaran" /><button type="submit" disabled={saving} className="rounded-sm border border-[#0f7f6d] px-4 py-2 text-sm font-semibold text-[#0f7f6d] disabled:opacity-60">Tambah jurnal</button><input value={journalNotes} onChange={(event) => setJournalNotes(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2 md:col-span-3" placeholder="Catatan jurnal (opsional)" /></form>{loaded && journals.length === 0 && <p className="mt-4 text-sm text-[#454545]/75">Belum ada jurnal pada penugasan ini.</p>}<ul className="mt-4 divide-y divide-[#E3E8E7]">{journals.map((journal) => <li key={journal.id} className="py-3"><p className="font-medium">{journal.topic}</p><p className="mt-1 text-sm text-[#454545]/70">{journal.date.slice(0, 10)}{journal.notes ? ` · ${journal.notes}` : ""}</p></li>)}</ul></section>
    </main>
  );
}
