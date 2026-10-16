import type { WorkflowStatus } from "@/actions/strategic";

const labels: Record<WorkflowStatus, string> = {
  draft: "Draft",
  submitted_to_biro: "Menunggu review Biro",
  accepted_by_biro: "Diterima Biro",
  revision_requested_by_biro: "Perlu revisi Biro",
  submitted_to_bidang: "Diajukan ke Bidang",
  revision_requested_by_bidang: "Perlu revisi Bidang",
  approved_by_bidang: "Disetujui Bidang",
};

const styles: Record<WorkflowStatus, string> = {
  draft: "bg-neutral text-primary border-border",
  submitted_to_biro: "bg-amber-50 text-amber-900 border-amber-200",
  accepted_by_biro: "bg-[#e6f4f1] text-tertiary border-emerald-100",
  revision_requested_by_biro: "bg-rose-50 text-rose-800 border-rose-200",
  submitted_to_bidang: "bg-blue-50 text-blue-800 border-blue-200",
  revision_requested_by_bidang: "bg-rose-50 text-rose-800 border-rose-200",
  approved_by_bidang: "bg-[#e6f4f1] text-tertiary border-emerald-200",
};

export function workflowLabel(status?: string | null) {
  return labels[status as WorkflowStatus] || status || "Belum diajukan";
}

export function WorkflowStatusBadge({ status }: { status?: string | null }) {
  const normalized = status as WorkflowStatus;
  return (
    <span className={`inline-flex items-center border rounded-sm px-2 py-0.5 text-[10px] font-semibold ${styles[normalized] || styles.draft}`}>
      {workflowLabel(status)}
    </span>
  );
}
