"use client";

import { useCallback, useEffect, useState } from "react";
import { SimakinShell } from "@/components/simakin-shell";
import { ConfirmModal } from "@/components/confirm-modal";
import { createIssue, deleteIssue, getIssues, getPrograms, transitionWorkflow, type WorkflowStatus } from "@/actions/strategic";
import { WorkflowStatusBadge } from "@/components/strategic/workflow-status-badge";
import { EmptyState, ErrorState, LoadingState } from "@alfida/ui";

interface Program { id: string; title: string; }
interface IssueItem { id: string; programId: string; title: string; description: string; impactScore?: number | null; probabilityScore?: number | null; mitigationPlan?: string | null; workflowStatus?: WorkflowStatus; createdAt: string; program?: Program; }

export default function IssuesPage() {
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ programId: "", title: "", description: "", impactScore: 3, probabilityScore: 3, mitigationPlan: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<IssueItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [issueData, programData] = await Promise.all([getIssues(), getPrograms()]);
      setIssues(Array.isArray(issueData) ? issueData as IssueItem[] : []);
      setPrograms(Array.isArray(programData) ? programData as Program[] : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal memuat daftar kendala.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const openCreate = () => {
    setIssueForm({ programId: programs[0]?.id || "", title: "", description: "", impactScore: 3, probabilityScore: 3, mitigationPlan: "" });
    setIsModalOpen(true);
  };

  const submitIssue = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!issueForm.programId || !issueForm.title.trim() || !issueForm.description.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const issue = await createIssue({ ...issueForm, title: issueForm.title.trim(), description: issueForm.description.trim(), mitigationPlan: issueForm.mitigationPlan.trim() || undefined }) as { id: string };
      await transitionWorkflow("issue", issue.id, "submitted_to_biro");
      setIsModalOpen(false);
      setFeedback("Kendala dikirim dengan status Menunggu review Biro.");
      await fetchData();
    } catch (caught) {
      setFeedback(caught instanceof Error ? caught.message : "Kendala belum dapat dikirim.");
    } finally { setSubmitting(false); }
  };

  const remove = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      await deleteIssue(deleting.id);
      setDeleting(null);
      setFeedback("Kendala draft dihapus.");
      await fetchData();
    } catch (caught) {
      setFeedback(caught instanceof Error ? caught.message : "Kendala belum dapat dihapus.");
    } finally { setSubmitting(false); }
  };

  return (
    <SimakinShell activePath="/issues">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="font-heading text-2xl font-bold text-primary">Kendala & Mitigasi</h1><p className="mt-1 text-xs text-gray-500">PIC mencatat dampak, probabilitas, dan mitigasi untuk direview Biro.</p></div><button type="button" onClick={openCreate} className="inline-flex items-center gap-1.5 self-start rounded-sm bg-tertiary px-4 py-2 text-xs font-semibold text-on-tertiary hover:bg-emerald-700"><span className="material-symbols-rounded text-[18px]">report_problem</span>Laporkan kendala</button></div>
        {feedback && <p className="mt-4 rounded-sm border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900" role="status">{feedback}</p>}
        <div className="mt-6">{loading ? <LoadingState message="Memuat daftar kendala..." /> : error ? <ErrorState title="Gagal Memuat Kendala" message={error} onRetry={fetchData} /> : issues.length === 0 ? <EmptyState title="Tidak Ada Kendala Aktif" description="Belum ada kendala yang dicatat untuk review." /> : <div className="overflow-x-auto rounded-lg border border-border bg-surface"><table className="min-w-full divide-y divide-border text-left text-xs"><thead className="bg-neutral text-[11px] font-semibold uppercase tracking-wider text-gray-600"><tr><th className="px-5 py-3">Kendala</th><th className="px-5 py-3">Risiko</th><th className="px-5 py-3">Mitigasi</th><th className="px-5 py-3">Workflow</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-border">{issues.map((issue) => <tr key={issue.id}><td className="max-w-sm px-5 py-4"><p className="font-semibold text-primary">{issue.title}</p><p className="mt-1 text-[11px] text-gray-600">{issue.description}</p><p className="mt-1 text-[10px] text-gray-400">{issue.program?.title || "Program tidak tersedia"} · {new Date(issue.createdAt).toLocaleDateString("id-ID")}</p></td><td className="px-5 py-4 text-[11px] text-primary">Dampak {issue.impactScore || "—"}/5<br />Probabilitas {issue.probabilityScore || "—"}/5</td><td className="max-w-xs px-5 py-4 text-[11px] text-gray-600">{issue.mitigationPlan || "Belum ada mitigasi"}</td><td className="px-5 py-4"><WorkflowStatusBadge status={issue.workflowStatus} /></td><td className="px-5 py-4 text-right">{issue.workflowStatus === "draft" && <button type="button" onClick={() => setDeleting(issue)} className="rounded-sm border border-rose-200 px-2.5 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-50">Hapus draft</button>}</td></tr>)}</tbody></table></div>}</div>
      </div>
      {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true"><form onSubmit={submitIssue} className="w-full max-w-lg rounded-lg border border-border bg-surface p-5"><div className="flex items-start justify-between border-b border-border pb-3"><div><h2 className="font-heading text-base font-bold text-primary">Laporkan kendala</h2><p className="mt-1 text-xs text-gray-500">Kendala baru otomatis dikirim ke review Biro.</p></div><button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-500"><span className="material-symbols-rounded">close</span></button></div><div className="mt-4 space-y-3"><select required value={issueForm.programId} onChange={(event) => setIssueForm({ ...issueForm, programId: event.target.value })} className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary"><option value="">Pilih program kerja</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.title}</option>)}</select><input required value={issueForm.title} onChange={(event) => setIssueForm({ ...issueForm, title: event.target.value })} placeholder="Pokok kendala" className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary" /><textarea required rows={4} value={issueForm.description} onChange={(event) => setIssueForm({ ...issueForm, description: event.target.value })} placeholder="Uraian masalah" className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary" /><div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-primary">Dampak (1–5)<input type="number" min="1" max="5" value={issueForm.impactScore} onChange={(event) => setIssueForm({ ...issueForm, impactScore: Number(event.target.value) })} className="mt-1 w-full rounded-sm border border-border px-3 py-2 text-xs" /></label><label className="text-xs font-semibold text-primary">Probabilitas (1–5)<input type="number" min="1" max="5" value={issueForm.probabilityScore} onChange={(event) => setIssueForm({ ...issueForm, probabilityScore: Number(event.target.value) })} className="mt-1 w-full rounded-sm border border-border px-3 py-2 text-xs" /></label></div><textarea rows={3} value={issueForm.mitigationPlan} onChange={(event) => setIssueForm({ ...issueForm, mitigationPlan: event.target.value })} placeholder="Rencana mitigasi" className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary" /></div><div className="mt-5 flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="rounded-sm border border-border px-4 py-2 text-xs font-semibold text-primary">Batal</button><button type="submit" disabled={submitting} className="rounded-sm bg-tertiary px-4 py-2 text-xs font-semibold text-on-tertiary disabled:opacity-50">{submitting ? "Mengirim..." : "Kirim ke Biro"}</button></div></form></div>}
      <ConfirmModal isOpen={Boolean(deleting)} title="Hapus kendala draft" message={`Hapus kendala “${deleting?.title || ""}”? Hanya draft yang dapat dihapus.`} confirmLabel="Hapus draft" loading={submitting} onCancel={() => setDeleting(null)} onConfirm={() => void remove()} />
    </SimakinShell>
  );
}
