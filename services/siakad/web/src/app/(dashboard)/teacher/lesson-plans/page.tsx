"use client";

import { FormEvent, useEffect, useState } from "react";
import { siakadApiFetch } from "@/lib/api";

type LessonPlan = { id: string; type: "prota" | "promes" | "rpp"; title: string; objectives?: string | null; teacherAssignment?: { subject?: { name?: string }; classroom?: { name?: string } } };

export default function TeacherLessonPlansPage() {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [type, setType] = useState<LessonPlan["type"]>("rpp");
  const [title, setTitle] = useState("");
  const [objectives, setObjectives] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadPlans() {
    setLoading(true);
    setError(null);
    try {
      setPlans(await siakadApiFetch<LessonPlan[]>("/lesson-plans"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal memuat perangkat ajar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadPlans(); }, []);

  async function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assignmentId.trim() || !title.trim()) {
      setError("ID penugasan dan judul perangkat ajar wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await siakadApiFetch<LessonPlan>("/lesson-plans", { method: "POST", body: JSON.stringify({ teacherAssignmentId: assignmentId.trim(), type, title: title.trim(), objectives: objectives || undefined }) });
      setPlans((current) => [created, ...current]);
      setTitle("");
      setObjectives("");
      setSuccess("Perangkat ajar berhasil disimpan.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal menyimpan perangkat ajar.");
    } finally {
      setSaving(false);
    }
  }

  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-5 md:p-8">
    <header><p className="text-xs font-semibold uppercase tracking-[.08em] text-[#0f7f6d]">Ruang guru</p><h1 className="mt-2 font-heading text-3xl text-[#454545]">Perangkat ajar</h1><p className="mt-2 text-sm text-[#454545]/75">Prota, promes, dan RPP selalu terikat ke penugasan mengajar Anda.</p></header>
    <form onSubmit={createPlan} className="grid gap-3 rounded-lg border border-[#E3E8E7] bg-white p-5 md:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium">ID penugasan<input value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" placeholder="UUID penugasan" /></label>
      <label className="grid gap-2 text-sm font-medium">Jenis<select value={type} onChange={(event) => setType(event.target.value as LessonPlan["type"])} className="rounded-sm border border-[#E3E8E7] bg-white px-3 py-2"><option value="prota">Prota</option><option value="promes">Promes</option><option value="rpp">RPP</option></select></label>
      <label className="grid gap-2 text-sm font-medium md:col-span-2">Judul<input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" placeholder="Contoh: RPP Aljabar" /></label>
      <label className="grid gap-2 text-sm font-medium md:col-span-2">Tujuan (opsional)<textarea value={objectives} onChange={(event) => setObjectives(event.target.value)} className="min-h-20 rounded-sm border border-[#E3E8E7] px-3 py-2" /></label>
      <button disabled={saving} className="justify-self-start rounded-sm bg-[#0f7f6d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Menyimpan…" : "Simpan perangkat"}</button>
    </form>
    {error && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {success && <p role="status" className="rounded-sm border border-[#b9dfd8] bg-[#e6f4f1] p-3 text-sm text-[#0f7f6d]">{success}</p>}
    {loading && <p className="text-sm text-[#454545]/70">Memuat perangkat ajar…</p>}
    {!loading && plans.length === 0 && <p className="rounded-lg border border-[#E3E8E7] bg-white p-5 text-sm text-[#454545]/75">Belum ada perangkat ajar pada penugasan Anda.</p>}
    {plans.length > 0 && <section className="overflow-hidden rounded-lg border border-[#E3E8E7] bg-white"><div className="border-b border-[#E3E8E7] p-4"><h2 className="font-heading text-xl">Daftar perangkat</h2></div><ul className="divide-y divide-[#E3E8E7]">{plans.map((plan) => <li key={plan.id} className="p-4"><p className="font-semibold text-[#454545]">{plan.title}</p><p className="mt-1 text-sm text-[#454545]/70">{plan.type.toUpperCase()} · {plan.teacherAssignment?.subject?.name || "Mata pelajaran"} · {plan.teacherAssignment?.classroom?.name || "Kelas"}</p></li>)}</ul></section>}
  </main>;
}
