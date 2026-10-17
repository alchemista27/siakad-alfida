"use client";

export interface AdminNoticeState {
  type: "success" | "error" | "info";
  message: string;
}

export function AdminNotice({
  notice,
  onDismiss,
}: {
  notice: AdminNoticeState | null;
  onDismiss?: () => void;
}) {
  if (!notice) return null;
  const tone =
    notice.type === "error"
      ? "bg-red-50 border-red-200 text-red-800"
      : notice.type === "success"
        ? "bg-[#e6f4f1] border-[#b9ded7] text-[#0b6355]"
        : "bg-white border-[#E3E8E7] text-[#454545]";

  return (
    <div className={`border rounded-md p-4 text-xs flex items-center justify-between gap-3 ${tone}`}>
      <span>{notice.message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-semibold underline opacity-80 hover:opacity-100"
        >
          Tutup
        </button>
      )}
    </div>
  );
}
