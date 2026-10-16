"use client";

import { useEffect, useState } from "react";
import { getAttentionQueue, createExecutiveIntervention, type AttentionQueue, type WorkflowResourceType } from "@/actions/strategic";

interface AttentionQueueProps {
  canIntervene: boolean;
}

const queueMeta = [
  ["overdue_pic_tasks", "PIC terlambat", "assignment_late"],
  ["overdue_biro_reviews", "Review Biro terlambat", "rate_review"],
  ["overdue_bidang_reviews", "Review Bidang terlambat", "fact_check"],
  ["open_interventions", "Teguran belum selesai", "warning"],
] as const;

export function AttentionQueue({ canIntervene }: AttentionQueueProps) {
  const [queue, setQueue] = useState<AttentionQueue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageFor, setMessageFor] = useState<{ id: string; departmentId?: string; recipientId?: string; resourceType?: WorkflowResourceType } | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    try {
      setQueue(await getAttentionQueue());
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Antrean perhatian belum dapat dimuat.");
    }
  };

  useEffect(() => { void refresh(); }, []);

  const submitIntervention = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!messageFor || !message.trim() || !messageFor.departmentId || !messageFor.recipientId) return;
    setSubmitting(true);
    try {
      await createExecutiveIntervention({
        departmentId: messageFor.departmentId,
        recipientId: messageFor.recipientId,
        resourceType: messageFor.resourceType,
        resourceId: messageFor.id,
        message: message.trim(),
      });
      setMessageFor(null);
      setMessage("");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Teguran belum dapat dikirim.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-primary">Antrean perhatian pimpinan</h2>
          <p className="mt-1 text-xs text-gray-500">Empat indikator overdue dipisahkan agar prioritas dan akuntabilitas tetap jelas.</p>
        </div>
        <button type="button" onClick={() => void refresh()} className="rounded-sm border border-border px-3 py-2 text-xs font-semibold text-tertiary hover:bg-neutral">Muat ulang</button>
      </div>
      {error && <p className="mt-3 rounded-sm border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800" role="alert">{error}</p>}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {queueMeta.map(([key, label, icon]) => {
          const entries = queue?.[key] || [];
          return (
            <div key={key} className="rounded-lg border border-border bg-neutral p-4">
              <div className="flex items-center justify-between"><span className="material-symbols-rounded text-tertiary">{icon}</span><span className="font-heading text-2xl font-bold text-primary">{entries.length}</span></div>
              <p className="mt-3 text-xs font-semibold text-primary">{label}</p>
              <ul className="mt-2 max-h-32 space-y-2 overflow-y-auto text-[11px] text-gray-600">
                {entries.slice(0, 4).map((entry) => {
                  const item = entry as Record<string, unknown>;
                  const resourceType = key === "overdue_biro_reviews" ? "realization_log" : key === "overdue_bidang_reviews" ? "work_program" : undefined;
                  const recipientId = typeof item.assigneeId === "string" ? item.assigneeId : typeof item.ownerId === "string" ? item.ownerId : typeof item.picId === "string" ? item.picId : undefined;
                  return <li key={String(item.id)} className="rounded-sm border border-border bg-surface p-2">
                    <span className="block truncate">{String(item.title || item.name || item.description || item.id)}</span>
                    {canIntervene && key !== "open_interventions" && <button type="button" disabled={!recipientId || !item.departmentId} onClick={() => setMessageFor({ id: String(item.id), departmentId: typeof item.departmentId === "string" ? item.departmentId : undefined, recipientId, resourceType })} className="mt-1 text-[10px] font-semibold text-tertiary hover:underline disabled:text-gray-400">Beri teguran</button>}
                  </li>;
                })}
                {entries.length === 0 && <li className="italic text-gray-400">Tidak ada item.</li>}
              </ul>
            </div>
          );
        })}
      </div>
      {messageFor && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <form onSubmit={submitIntervention}>
          <label htmlFor="intervention-message" className="text-xs font-semibold text-primary">Pesan teguran *</label>
          <textarea id="intervention-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={3} className="mt-1.5 w-full rounded-sm border border-amber-200 bg-surface px-3 py-2 text-xs text-primary outline-none focus:ring-2 focus:ring-tertiary" placeholder="Sampaikan tindakan perbaikan dan batas waktunya." />
          <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setMessageFor(null)} className="rounded-sm border border-border px-3 py-2 text-xs font-semibold text-primary">Batal</button><button type="submit" disabled={submitting || !message.trim()} className="rounded-sm bg-tertiary px-3 py-2 text-xs font-semibold text-on-tertiary disabled:opacity-50">{submitting ? "Mengirim..." : "Kirim teguran"}</button></div>
        </form>
      </div>}
    </section>
  );
}
