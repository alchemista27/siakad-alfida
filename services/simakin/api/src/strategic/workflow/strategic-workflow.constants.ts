export const BIRO_REVIEW_SLA_DAYS = 2;
export const BIDANG_REVIEW_SLA_DAYS = 3;

export function reviewDueAt(stage: "biro" | "bidang", from = new Date()) {
  const due = new Date(from);
  due.setUTCDate(due.getUTCDate() + (stage === "biro" ? BIRO_REVIEW_SLA_DAYS : BIDANG_REVIEW_SLA_DAYS));
  return due;
}
