"use client";

import { FormEvent, useEffect, useState } from "react";
import { siakadApiFetch } from "@/lib/api";

type Activity = { id: string; name: string; category: string; academicYear?: { name?: string } };

export default function AdminExtracurricularsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [academicYearId, setAcademicYearId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [coachUserId, setCoachUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadActivities() {
    setLoading(true); setError(null);
    try { setActivities(await siakadApiFetch<Activity[]>("/extracurriculars")); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal memuat ekstrakurikuler."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadActivities(); }, []);

  async function createActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!academicYearId.trim() || !name.trim()) { setError("ID tahun ajaran aktif dan nama kegiatan wajib diisi."); return; }
    setSaving(true); setError(null); setSuccess(null);
    try {
      const activity = await siakadApiFetch<Activity>("/extracurriculars", { method: "POST", body: JSON.stringify({ academicYearId: academicYearId.trim(), name: name.trim(), category: category.trim() || "general", coachUserId: coachUserId.trim() || undefined }) });
      setActivities((current) => [...current, activity].sort((a, b) => a.name.localeCompare(b.name)));
      setName(""); setCoachUserId(""); setSuccess("Ekstrakurikuler aktif berhasil dibuat.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal membuat ekstrakurikuler."); }
    finally { setSaving(false); }
  }

  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-5 md:p-8">
    <header><p className="text-xs font-semibold uppercase tracking-[.08em] text-[#0f7f6d]">Administrasi unit</p><h1 className="mt-2 font-heading text-3xl text-[#454545]">Ekstrakurikuler</h1><p className="mt-2 text-sm text-[#454545]/75">Buat kegiatan hanya untuk tahun ajaran aktif di unit Anda, lalu tetapkan pelatih dari unit yang sama.</p></header>
    <form onSubmit={createActivity} className="grid gap-3 rounded-lg border border-[#E3E8E7] bg-white p-5 md:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium">ID tahun ajaran aktif<input value={academicYearId} onChange={(event) => setAcademicYearId(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" /></label>
      <label className="grid gap-2 text-sm font-medium">Nama kegiatan<input value={name} onChange={(event) => setName(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" /></label>
      <label className="grid gap-2 text-sm font-medium">Kategori<input value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" /></label>
      <label className="grid gap-2 text-sm font-medium">ID pelatih (opsional)<input value={coachUserId} onChange={(event) => setCoachUserId(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" /></label>
      <button disabled={saving} className="justify-self-start rounded-sm bg-[#0f7f6d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Menyimpan…" : "Buat kegiatan"}</button>
    </form>
    {error && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{success && <p role="status" className="rounded-sm border border-[#b9dfd8] bg-[#e6f4f1] p-3 text-sm text-[#0f7f6d]">{success}</p>}
    {loading && <p className="text-sm text-[#454545]/70">Memuat ekstrakurikuler…</p>}
    {!loading && activities.length === 0 && <p className="rounded-lg border border-[#E3E8E7] bg-white p-5 text-sm text-[#454545]/75">Belum ada ekstrakurikuler aktif di unit ini.</p>}
    {activities.length > 0 && <section className="rounded-lg border border-[#E3E8E7] bg-white"><div className="border-b border-[#E3E8E7] p-4"><h2 className="font-heading text-xl">Kegiatan aktif</h2></div><ul className="divide-y divide-[#E3E8E7]">{activities.map((activity) => <li key={activity.id} className="p-4"><p className="font-semibold text-[#454545]">{activity.name}</p><p className="mt-1 text-sm text-[#454545]/70">{activity.category} · {activity.academicYear?.name || "Tahun ajaran aktif"}</p></li>)}</ul></section>}
  </main>;
}
