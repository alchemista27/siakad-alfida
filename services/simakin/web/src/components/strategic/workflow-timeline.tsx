import type { WorkflowResource } from "@/actions/strategic";
import { workflowLabel } from "./workflow-status-badge";

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export function WorkflowTimeline({ resource }: { resource: WorkflowResource }) {
  const entries = [
    { label: "Dibuat", value: resource.createdAt },
    { label: workflowLabel(resource.workflowStatus), value: resource.submittedAt || resource.lastReviewedAt || resource.updatedAt },
    ...(resource.reviewDueAt ? [{ label: "Batas review", value: resource.reviewDueAt }] : []),
  ];

  return (
    <ol className="space-y-3 border-l border-border pl-4 text-xs">
      {entries.map((entry, index) => (
        <li key={`${entry.label}-${index}`} className="relative">
          <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full border border-emerald-200 bg-[#e6f4f1]" />
          <p className="font-semibold text-primary">{entry.label}</p>
          <p className="mt-0.5 text-gray-500">{formatDate(entry.value as string | null | undefined)}</p>
        </li>
      ))}
    </ol>
  );
}
