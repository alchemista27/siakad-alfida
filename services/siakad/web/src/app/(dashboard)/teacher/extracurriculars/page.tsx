"use client";

import { FormEvent, useState } from "react";
import { siakadApiFetch } from "@/lib/api";

type Schedule = { id: string; dayOfWeek: number; startTime: string; endTime: string; location?: string | null };
type Journal = { id: string; date: string; activity: string; notes?: string | null };

export default function TeacherExtracurricularsPage() {
  const [activityId, setActivityId] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState("6");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [journalDate, setJournalDate] = useState(new Date().toISOString().slice(0, 10));
  const [journalActivity, setJournalActivity] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [grade, setGrade] = useState("A");

  async function loadActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activityId.trim()) { setError("ID ekstrakurikuler wajib diisi."); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const id = activityId.trim();
      const [scheduleRows, journalRows] = await Promise.all([siakadApiFetch<Schedule[]>(`/extracurriculars/${id}/schedules`), siakadApiFetch<Journal[]>(`/extracurriculars/${id}/journals`)]);
      setSchedules(scheduleRows); setJournals(journalRows); setLoaded(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal memuat jadwal dan jurnal."); setSchedules([]); setJournals([]); setLoaded(false); }
    finally { setLoading(false); }
  }

  async function addSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!activityId.trim()) { setError("Muat ekstrakurikuler terlebih dahulu."); return; }
    setSaving(true); setError(null); setSuccess(null);
    try {
      const created = await siakadApiFetch<Schedule>(`/extracurriculars/${activityId.trim()}/schedules`, { method: "POST", body: JSON.stringify({ dayOfWeek: Number(dayOfWeek), startTime, endTime, location: location || undefined }) });
      setSchedules((current) => [...current, created]); setLocation(""); setSuccess("Jadwal latihan berhasil ditambahkan.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal menambahkan jadwal."); }
    finally { setSaving(false); }
  }

  async function addJournal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!activityId.trim() || !journalActivity.trim()) { setError("ID ekstrakurikuler dan kegiatan jurnal wajib diisi."); return; }
    setSaving(true); setError(null); setSuccess(null);
    try {
      const created = await siakadApiFetch<Journal>(`/extracurriculars/${activityId.trim()}/journals`, { method: "POST", body: JSON.stringify({ date: journalDate, activity: journalActivity.trim() }) });
      setJournals((current) => [created, ...current]); setJournalActivity(""); setSuccess("Jurnal latihan berhasil disimpan.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal menyimpan jurnal."); }
    finally { setSaving(false); }
  }

  async function saveGrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!activityId.trim() || !membershipId.trim()) { setError("ID keanggotaan wajib diisi."); return; }
    setSaving(true); setError(null); setSuccess(null);
    try { await siakadApiFetch(`/extracurriculars/${activityId.trim()}/grades`, { method: "PUT", body: JSON.stringify({ membershipId: membershipId.trim(), semester: 1, grade }) }); setSuccess("Nilai semester 1 berhasil disimpan."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal menyimpan nilai."); }
    finally { setSaving(false); }
  }

  return <main className="mx-auto min-h-screen max-w-6xl space-y-6 p-5 md:p-8">
    <header><p className="text-xs font-semibold uppercase tracking-[.08em] text-[#0f7f6d]">Ruang pelatih</p><h1 className="mt-2 font-heading text-3xl text-[#454545]">Jadwal, jurnal, dan nilai ekstrakurikuler</h1></header>
    <form onSubmit={loadActivity} className="flex flex-wrap gap-3 rounded-lg border border-[#E3E8E7] bg-white p-5"><label className="grid flex-1 gap-2 text-sm font-medium">ID ekstrakurikuler<input value={activityId} onChange={(event) => setActivityId(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" /></label><button disabled={loading} className="self-end rounded-sm bg-[#0f7f6d] px-4 py-2 text-sm font-semibold text-white">{loading ? "Memuat…" : "Muat kegiatan"}</button></form>
    {error && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{success && <p role="status" className="rounded-sm border border-[#b9dfd8] bg-[#e6f4f1] p-3 text-sm text-[#0f7f6d]">{success}</p>}{loading && <p className="text-sm text-[#454545]/70">Memuat kegiatan pelatih…</p>}
    {loaded && !loading && schedules.length === 0 && journals.length === 0 && <p className="rounded-lg border border-[#E3E8E7] bg-white p-5 text-sm text-[#454545]/75">Belum ada jadwal atau jurnal pada kegiatan ini.</p>}
    <section className="grid gap-5 md:grid-cols-2"><form onSubmit={addSchedule} className="space-y-3 rounded-lg border border-[#E3E8E7] bg-white p-5"><h2 className="font-heading text-xl">Tambah jadwal</h2><div className="grid grid-cols-3 gap-2"><input inputMode="numeric" value={dayOfWeek} onChange={(event) => setDayOfWeek(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-2 py-2" placeholder="Hari 1–7" /><input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-2 py-2" /><input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-2 py-2" /></div><input value={location} onChange={(event) => setLocation(event.target.value)} className="w-full rounded-sm border border-[#E3E8E7] px-3 py-2" placeholder="Lokasi" /><button disabled={saving} className="rounded-sm border border-[#0f7f6d] px-4 py-2 text-sm font-semibold text-[#0f7f6d]">Tambah jadwal</button></form><form onSubmit={addJournal} className="space-y-3 rounded-lg border border-[#E3E8E7] bg-white p-5"><h2 className="font-heading text-xl">Tambah jurnal</h2><input type="date" value={journalDate} onChange={(event) => setJournalDate(event.target.value)} className="w-full rounded-sm border border-[#E3E8E7] px-3 py-2" /><input value={journalActivity} onChange={(event) => setJournalActivity(event.target.value)} className="w-full rounded-sm border border-[#E3E8E7] px-3 py-2" placeholder="Kegiatan latihan" /><button disabled={saving} className="rounded-sm border border-[#0f7f6d] px-4 py-2 text-sm font-semibold text-[#0f7f6d]">Simpan jurnal</button></form></section>
    <form onSubmit={saveGrade} className="flex flex-wrap items-end gap-3 rounded-lg border border-[#E3E8E7] bg-white p-5"><label className="grid flex-1 gap-2 text-sm font-medium">ID keanggotaan<input value={membershipId} onChange={(event) => setMembershipId(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" /></label><label className="grid gap-2 text-sm font-medium">Nilai<select value={grade} onChange={(event) => setGrade(event.target.value)} className="rounded-sm border border-[#E3E8E7] bg-white px-3 py-2"><option>A</option><option>B</option><option>C</option><option>D</option></select></label><button disabled={saving} className="rounded-sm bg-[#0f7f6d] px-4 py-2 text-sm font-semibold text-white">Simpan nilai</button></form>
    {schedules.length > 0 && <ul className="rounded-lg border border-[#E3E8E7] bg-white divide-y divide-[#E3E8E7]">{schedules.map((item) => <li key={item.id} className="p-4 text-sm">Hari {item.dayOfWeek} · {item.startTime}–{item.endTime}{item.location ? ` · ${item.location}` : ""}</li>)}</ul>}{journals.length > 0 && <ul className="rounded-lg border border-[#E3E8E7] bg-white divide-y divide-[#E3E8E7]">{journals.map((item) => <li key={item.id} className="p-4"><p className="font-medium">{item.activity}</p><p className="text-sm text-[#454545]/70">{item.date.slice(0, 10)}</p></li>)}</ul>}
  </main>;
}
