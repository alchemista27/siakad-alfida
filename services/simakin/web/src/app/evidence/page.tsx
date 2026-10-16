"use client";

import { useCallback, useEffect, useState } from "react";
import { SimakinShell } from "@/components/simakin-shell";
import { CloudinaryUploadButton } from "@/components/cloudinary-upload-button";
import { createEvidence, getEvidences, getPrograms, transitionWorkflow, type WorkflowStatus } from "@/actions/strategic";
import { WorkflowStatusBadge } from "@/components/strategic/workflow-status-badge";
import { EmptyState, ErrorState, LoadingState } from "@alfida/ui";

interface Program { id: string; title: string; }
interface EvidenceItem { id: string; name: string; type?: string; nature?: string; digitalLink?: string | null; createdAt: string; workflowStatus?: WorkflowStatus; program?: Program | null; task?: { description?: string } | null; notes?: string | null; }

export default function EvidencePage() {
  const [evidences, setEvidences] = useState<EvidenceItem[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ programId: "", name: "", type: "document", nature: "supporting", digitalLink: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [evidenceData, programData] = await Promise.all([getEvidences(), getPrograms()]);
      setEvidences(Array.isArray(evidenceData) ? evidenceData as EvidenceItem[] : []);
      setPrograms(Array.isArray(programData) ? programData as Program[] : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal memuat bukti dukung.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const openCreate = () => {
    setForm({ programId: programs[0]?.id || "", name: "", type: "document", nature: "supporting", digitalLink: "", notes: "" });
    setIsModalOpen(true);
  };

  const saveEvidence = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.programId || !form.name.trim() || !form.digitalLink.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const evidence = await createEvidence({ programId: form.programId, name: form.name.trim(), type: form.type, nature: form.nature, digitalLink: form.digitalLink.trim(), notes: form.notes.trim() || undefined }) as { id: string };
      await transitionWorkflow("evidence", evidence.id, "submitted_to_biro");
      setIsModalOpen(false);
      setFeedback("Bukti dikirim dengan status Menunggu review Biro.");
      await fetchData();
    } catch (caught) {
      setFeedback(caught instanceof Error ? caught.message : "Bukti belum dapat disimpan.");
    } finally { setSubmitting(false); }
  };

  return (
    <SimakinShell activePath="/evidence">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="font-heading text-2xl font-bold text-primary">Bukti Dukung</h1><p className="mt-1 text-xs text-gray-500">Dokumen dan foto operasional dikirim melalui Cloudinary lalu direview Biro.</p></div><button type="button" onClick={openCreate} className="inline-flex items-center gap-1.5 self-start rounded-sm bg-tertiary px-4 py-2 text-xs font-semibold text-on-tertiary hover:bg-emerald-700"><span className="material-symbols-rounded text-[18px]">cloud_upload</span>Unggah bukti</button></div>
        {feedback && <p className="mt-4 rounded-sm border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900" role="status">{feedback}</p>}
        <div className="mt-6">{loading ? <LoadingState message="Memuat repositori bukti dukung..." /> : error ? <ErrorState title="Gagal Memuat Bukti" message={error} onRetry={fetchData} /> : evidences.length === 0 ? <EmptyState title="Belum Ada Bukti Dukung" description="Belum ada bukti yang diunggah untuk review." /> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{evidences.map((evidence) => <article key={evidence.id} className="flex min-h-48 flex-col justify-between rounded-lg border border-border bg-surface p-5"><div><div className="flex items-start justify-between gap-3"><span className="material-symbols-rounded text-tertiary">{evidence.type === "photo" ? "image" : "description"}</span><WorkflowStatusBadge status={evidence.workflowStatus} /></div><h2 className="mt-4 font-heading text-base font-bold text-primary">{evidence.name}</h2><p className="mt-1 text-xs text-gray-500">{evidence.program?.title || "Program tidak tersedia"}</p>{evidence.notes && <p className="mt-3 text-xs text-gray-600">{evidence.notes}</p>}</div><div className="mt-4 border-t border-border pt-3"><p className="text-[10px] text-gray-400">{new Date(evidence.createdAt).toLocaleDateString("id-ID")}</p>{evidence.digitalLink && <a href={evidence.digitalLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-tertiary hover:underline">Buka bukti <span className="material-symbols-rounded text-[14px]">open_in_new</span></a>}</div></article>)}</div>}</div>
      </div>
      {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true"><form onSubmit={saveEvidence} className="w-full max-w-lg rounded-lg border border-border bg-surface p-5"><div className="flex items-start justify-between border-b border-border pb-3"><div><h2 className="font-heading text-base font-bold text-primary">Unggah bukti dukung</h2><p className="mt-1 text-xs text-gray-500">Gunakan Cloudinary untuk bukti operasional.</p></div><button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-500"><span className="material-symbols-rounded">close</span></button></div><div className="mt-4 space-y-3"><select required value={form.programId} onChange={(event) => setForm({ ...form, programId: event.target.value })} className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary"><option value="">Pilih program kerja</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.title}</option>)}</select><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nama bukti" className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary" /><div className="grid grid-cols-2 gap-3"><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary"><option value="document">Dokumen</option><option value="photo">Foto</option><option value="link">Tautan</option></select><select value={form.nature} onChange={(event) => setForm({ ...form, nature: event.target.value })} className="rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary"><option value="supporting">Pendukung</option><option value="mandatory">Wajib</option></select></div><CloudinaryUploadButton onUploadSuccess={(url, fileName) => setForm((current) => ({ ...current, digitalLink: url, name: current.name || fileName || "" }))} buttonText="Pilih file & unggah ke Cloudinary" /><input required type="url" value={form.digitalLink} onChange={(event) => setForm({ ...form, digitalLink: event.target.value })} placeholder="Tautan Cloudinary" className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary" /><textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Catatan bukti (opsional)" className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary" /></div><div className="mt-5 flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="rounded-sm border border-border px-4 py-2 text-xs font-semibold text-primary">Batal</button><button type="submit" disabled={submitting} className="rounded-sm bg-tertiary px-4 py-2 text-xs font-semibold text-on-tertiary disabled:opacity-50">{submitting ? "Menyimpan..." : "Kirim ke Biro"}</button></div></form></div>}
    </SimakinShell>
  );
}
