"use client";

import { useEffect, useState } from "react";
import { siakadApiFetch } from "@/lib/api";

type Overview = { children: { student: { id: string; fullName: string }; extracurricular: { name: string; semester: number; grade: string; notes: string | null }[] }[] };

export default function ParentExtracurricularsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function load() {
    setLoading(true); setError(null);
    try { setOverview(await siakadApiFetch<Overview>("/parent-portal/overview")); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal memuat ringkasan ekstrakurikuler."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-5 md:p-8">
    <header><p className="text-xs font-semibold uppercase tracking-[.08em] text-[#0f7f6d]">Portal orang tua</p><h1 className="mt-2 font-heading text-3xl text-[#454545]">Ekstrakurikuler anak</h1><p className="mt-2 text-sm text-[#454545]/75">Ringkasan kegiatan ini hanya-baca dan berasal dari data akademik anak yang terkait dengan akun Anda.</p></header>
    {error && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{loading && <p className="text-sm text-[#454545]/70">Memuat ekstrakurikuler…</p>}
    {!loading && !error && overview?.children.length === 0 && <p className="rounded-lg border border-[#E3E8E7] bg-white p-5 text-sm text-[#454545]/75">Belum ada anak yang terhubung ke akun ini.</p>}
    {!loading && overview?.children.map((child) => <section key={child.student.id} className="rounded-lg border border-[#E3E8E7] bg-white p-5"><h2 className="font-heading text-xl text-[#454545]">{child.student.fullName}</h2>{child.extracurricular.length === 0 ? <p className="mt-3 text-sm text-[#454545]/70">Belum ada ringkasan kegiatan.</p> : <ul className="mt-3 divide-y divide-[#E3E8E7]">{child.extracurricular.map((item) => <li key={`${item.name}-${item.semester}`} className="py-3"><p className="font-semibold">{item.name}</p><p className="mt-1 text-sm text-[#454545]/70">Semester {item.semester} · Nilai {item.grade}{item.notes ? ` · ${item.notes}` : ""}</p></li>)}</ul>}</section>)}
  </main>;
}
