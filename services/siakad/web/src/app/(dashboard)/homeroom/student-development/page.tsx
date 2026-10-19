"use client";

import { FormEvent, useEffect, useState } from "react";
import { siakadApiFetch } from "@/lib/api";

type DevelopmentRecord = { id: string; kind: string; occurredAt: string; summary: string; status: string; enrollment?: { student?: { fullName?: string } } };
const today = new Date().toISOString().slice(0, 10);

export default function HomeroomStudentDevelopmentPage() {
  const [records, setRecords] = useState<DevelopmentRecord[]>([]);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [kind, setKind] = useState("character");
  const [occurredAt, setOccurredAt] = useState(today);
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  async function load() {
    setLoading(true); setError(null);
    try { setRecords(await siakadApiFetch<DevelopmentRecord[]>("/student-development/homeroom")); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal memuat catatan perkembangan."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrollmentId.trim() || !summary.trim()) { setError("ID enrollment dan ringkasan wajib diisi."); return; }
    setSaving(true); setError(null); setSuccess(null);
    try { await siakadApiFetch("/student-development", { method: "POST", body: JSON.stringify({ enrollmentId: enrollmentId.trim(), kind, occurredAt, summary: summary.trim(), details: details.trim() || undefined }) }); setEnrollmentId(""); setSummary(""); setDetails(""); setSuccess("Catatan disimpan sebagai draf."); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal menyimpan catatan."); }
    finally { setSaving(false); }
  }
  async function approve(id: string) {
    setSaving(true); setError(null); setSuccess(null);
    try { await siakadApiFetch(`/student-development/${id}/approve`, { method: "PATCH" }); setSuccess("Catatan disetujui untuk ringkasan orang tua."); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal menyetujui catatan."); }
    finally { setSaving(false); }
  }

  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-5 md:p-8"><header><p className="text-xs font-semibold uppercase tracking-[.08em] text-[#0f7f6d]">Ruang wali kelas</p><h1 className="mt-2 font-heading text-3xl text-[#454545]">Perkembangan siswa</h1><p className="mt-2 text-sm text-[#454545]/75">Catatan selalu dikaitkan ke enrollment, kelas, dan tahun ajaran penugasan wali kelas.</p></header><form onSubmit={create} className="grid gap-3 rounded-lg border border-[#E3E8E7] bg-white p-5 md:grid-cols-2"><label className="grid gap-1 text-sm">ID enrollment<input value={enrollmentId} onChange={(event) => setEnrollmentId(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" /></label><label className="grid gap-1 text-sm">Jenis<select value={kind} onChange={(event) => setKind(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2"><option value="character">Karakter</option><option value="violation">Pelanggaran</option><option value="bpi">BPI</option></select></label><label className="grid gap-1 text-sm">Tanggal<input type="date" value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" /></label><label className="grid gap-1 text-sm">Ringkasan<input value={summary} onChange={(event) => setSummary(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" /></label><label className="grid gap-1 text-sm md:col-span-2">Rincian internal (opsional)<textarea value={details} onChange={(event) => setDetails(event.target.value)} className="min-h-24 rounded-sm border border-[#E3E8E7] px-3 py-2" /></label><button disabled={saving} className="justify-self-start rounded-sm bg-[#0f7f6d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Menyimpan…" : "Simpan catatan"}</button></form>{error && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{success && <p role="status" className="rounded-sm border border-[#b9dfd8] bg-[#e6f4f1] p-3 text-sm text-[#0f7f6d]">{success}</p>}{loading && <p className="text-sm text-[#454545]/70">Memuat catatan perkembangan…</p>}{!loading && records.length === 0 && <p className="rounded-lg border border-[#E3E8E7] bg-white p-5 text-sm text-[#454545]/75">Belum ada catatan pada penugasan wali kelas Anda.</p>}{records.length > 0 && <section className="rounded-lg border border-[#E3E8E7] bg-white"><ul className="divide-y divide-[#E3E8E7]">{records.map((record) => <li key={record.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-semibold">{record.enrollment?.student?.fullName ?? "Siswa"} · {record.summary}</p><p className="mt-1 text-sm text-[#454545]/70">{record.kind} · {new Date(record.occurredAt).toLocaleDateString("id-ID")} · {record.status}</p></div>{record.status !== "approved" && <button type="button" disabled={saving} onClick={() => void approve(record.id)} className="rounded-sm border border-[#0f7f6d] px-3 py-2 text-sm font-semibold text-[#0f7f6d]">Setujui</button>}</li>)}</ul></section>}</main>;
}
