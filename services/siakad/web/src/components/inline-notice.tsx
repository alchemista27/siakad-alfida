import type { ReactNode } from "react";

type InlineNoticeProps = {
  tone?: "info" | "success" | "error";
  title?: string;
  children: ReactNode;
};

const toneClasses = {
  info: "border-[#E3E8E7] bg-[#F7F8F8] text-[#454545]",
  success: "border-[#0f7f6d]/30 bg-[#0f7f6d]/10 text-[#0f7f6d]",
  error: "border-red-200 bg-red-50 text-red-800",
};

export function InlineNotice({ tone = "info", title, children }: InlineNoticeProps) {
  return (
    <div role="status" aria-live="polite" className={`rounded border px-4 py-3 text-sm ${toneClasses[tone]}`}>
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </div>
  );
}
