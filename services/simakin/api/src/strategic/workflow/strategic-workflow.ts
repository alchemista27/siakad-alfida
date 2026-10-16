export const allowedTransitions = {
  draft: ["submitted_to_biro", "submitted_to_bidang"],
  submitted_to_biro: ["accepted_by_biro", "revision_requested_by_biro"],
  revision_requested_by_biro: ["submitted_to_biro"],
  accepted_by_biro: ["submitted_to_bidang"],
  submitted_to_bidang: ["approved_by_bidang", "revision_requested_by_bidang"],
  revision_requested_by_bidang: ["submitted_to_biro", "submitted_to_bidang"],
  approved_by_bidang: [],
} as const;

export type WorkflowStatus = keyof typeof allowedTransitions;
export type WorkflowResourceType = "work_program" | "kpi" | "realization_log" | "evidence" | "issue";
