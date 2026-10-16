"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getKPIs,
  getLogs,
  getEvidences,
  getIssues,
  getMyActionItems,
  getPrograms,
  transitionWorkflow,
  type WorkflowResource,
  type WorkflowResourceType,
  type WorkflowStatus,
} from "@/actions/strategic";
import { RevisionNoteModal } from "./revision-note-modal";
import { WorkflowStatusBadge } from "./workflow-status-badge";
import { WorkflowTimeline } from "./workflow-timeline";

interface ApprovalItem extends WorkflowResource {
  resourceType: WorkflowResourceType;
  resourceName: string;
  reviewerNote?: string | null;
}

interface ApprovalInboxProps {
  roles: string[];
}

function isRole(roles: string[], role: string) {
  return roles.includes(role) || roles.includes("super_admin");
}

function toItems(items: unknown, resourceType: WorkflowResourceType): ApprovalItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((entry) => {
    const item = entry as WorkflowResource;
    return {
      ...item,
      resourceType,
      resourceName: String(item.title || item.name || item.activityName || "Pengajuan tanpa judul"),
      reviewerNote: typeof item.notes === "string" ? item.notes : typeof item.baselineNotes === "string" ? item.baselineNotes : null,
    };
  });
}

function isReviewable(item: ApprovalItem) {
  return ["submitted_to_biro", "submitted_to_bidang", "revision_requested_by_biro", "revision_requested_by_bidang", "accepted_by_biro"].includes(item.workflowStatus || "");
}

export function ApprovalInbox({ roles }: ApprovalInboxProps) {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [revisionTarget, setRevisionTarget] = useState<ApprovalItem | null>(null);

  const isPic = isRole(roles, "pic_program") || isRole(roles, "staff");
  const isBiro = isRole(roles, "admin_biro");
  const isBidang = isRole(roles, "admin_bidang");
  const readOnly = isRole(roles, "pimpinan") || isRole(roles, "pengawas");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isPic && !isBiro && !isBidang) {
        // This is the backend-owned, current-user action feed; do not derive it with a browser filter.
        const myItems = await getMyActionItems();
        setItems(toItems(myItems, "realization_log"));
        return;
      }
      const [programs, kpis, logs, evidences, issues] = await Promise.all([
        getPrograms(),
        getKPIs(),
        getLogs(),
        getEvidences(),
        getIssues(),
      ]);
      setItems([
        ...toItems(programs, "work_program"),
        ...toItems(kpis, "kpi"),
        ...toItems(logs, "realization_log"),
        ...toItems(evidences, "evidence"),
        ...toItems(issues, "issue"),
      ].filter(isReviewable));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal memuat antrean persetujuan.");
    } finally {
      setLoading(false);
    }
  }, [isBidang, isBiro, isPic]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const transition = async (item: ApprovalItem, status: WorkflowStatus, notes?: string) => {
    setProcessingId(item.id);
    setError(null);
    try {
      await transitionWorkflow(item.resourceType, item.id, status, notes);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Transisi workflow gagal disimpan.");
    } finally {
      setProcessingId(null);
    }
  };

  const grouped = useMemo(() => {
    if (!isBidang) return [["Antrean", items] as const];
    return Array.from(items.reduce((groups, item) => {
      const key = item.department?.name || item.program?.department?.name || "Biro tidak diketahui";
      groups.set(key, [...(groups.get(key) || []), item]);
      return groups;
    }, new Map<string, ApprovalItem[]>()).entries());
  }, [isBidang, items]);

  const heading = isPic
    ? "Tindak lanjut saya"
    : isBiro
      ? "Review Biro dan pengajuan ke Bidang"
      : isBidang
        ? "Menunggu persetujuan Bidang"
        : readOnly
          ? "Antrean persetujuan (baca saja)"
          : "Antrean workflow";

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-primary">{heading}</h2>
          <p className="mt-1 text-xs text-gray-500">
            {readOnly ? "Pimpinan dan Pengawas memantau tanpa mengubah status." : "Semua keputusan direkam pada workflow dan mengirim notifikasi ke pihak terkait."}
          </p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="rounded-sm border border-border px-3 py-2 text-xs font-semibold text-tertiary hover:bg-neutral disabled:opacity-50">
          <span className="material-symbols-rounded mr-1 align-middle text-[15px]">refresh</span>Muat ulang
        </button>
      </div>
      {error && <p className="mt-4 rounded-sm border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800" role="alert">{error}</p>}
      {loading ? (
        <p className="py-8 text-center text-xs text-gray-500">Memuat antrean workflow…</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-xs text-gray-500">Tidak ada item yang menunggu tindakan untuk peran Anda.</p>
      ) : (
        <div className="mt-4 space-y-5">
          {grouped.map(([group, groupItems]) => (
            <div key={group}>
              {isBidang && <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">{group}</h3>}
              <div className="space-y-3">
                {groupItems.map((item) => {
                  const busy = processingId === item.id;
                  const status = item.workflowStatus;
                  return (
                    <article key={`${item.resourceType}-${item.id}`} className="rounded-lg border border-border bg-neutral/60 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-primary">{item.resourceName}</h4>
                            <WorkflowStatusBadge status={status} />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{item.program?.department?.name || item.department?.name || "Scope unit tersedia pada record"}</p>
                          {item.reviewerNote && <p className="mt-2 rounded-sm border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900"><span className="font-semibold">Catatan terakhir:</span> {item.reviewerNote}</p>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {isBiro && status === "submitted_to_biro" && <>
                            <button type="button" disabled={busy} onClick={() => void transition(item, "accepted_by_biro")} className="rounded-sm bg-tertiary px-3 py-2 text-xs font-semibold text-on-tertiary disabled:opacity-50">Terima</button>
                            <button type="button" disabled={busy} onClick={() => setRevisionTarget(item)} className="rounded-sm border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-50 disabled:opacity-50">Minta revisi</button>
                          </>}
                          {isBiro && status === "accepted_by_biro" && <button type="button" disabled={busy} onClick={() => void transition(item, "submitted_to_bidang")} className="rounded-sm bg-tertiary px-3 py-2 text-xs font-semibold text-on-tertiary disabled:opacity-50">Ajukan ke Bidang</button>}
                          {isBiro && (status === "revision_requested_by_biro" || status === "revision_requested_by_bidang") && <button type="button" disabled={busy} onClick={() => void transition(item, status === "revision_requested_by_biro" ? "submitted_to_biro" : "submitted_to_bidang")} className="rounded-sm bg-tertiary px-3 py-2 text-xs font-semibold text-on-tertiary disabled:opacity-50">Ajukan ulang</button>}
                          {isBidang && status === "submitted_to_bidang" && <>
                            <button type="button" disabled={busy} onClick={() => void transition(item, "approved_by_bidang")} className="rounded-sm bg-tertiary px-3 py-2 text-xs font-semibold text-on-tertiary disabled:opacity-50">Setujui</button>
                            <button type="button" disabled={busy} onClick={() => setRevisionTarget(item)} className="rounded-sm border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-50 disabled:opacity-50">Minta revisi</button>
                          </>}
                        </div>
                      </div>
                      <details className="mt-3 border-t border-border pt-3">
                        <summary className="cursor-pointer text-xs font-semibold text-tertiary">Lihat status dan tenggat</summary>
                        <div className="mt-3"><WorkflowTimeline resource={item} /></div>
                      </details>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <RevisionNoteModal
        isOpen={Boolean(revisionTarget)}
        loading={Boolean(revisionTarget && processingId === revisionTarget.id)}
        onClose={() => setRevisionTarget(null)}
        onSubmit={async (notes) => {
          if (!revisionTarget) return;
          const targetStatus: WorkflowStatus = isBidang ? "revision_requested_by_bidang" : "revision_requested_by_biro";
          await transition(revisionTarget, targetStatus, notes);
          setRevisionTarget(null);
        }}
      />
    </section>
  );
}
