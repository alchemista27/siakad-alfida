"use client";

import { useEffect, useState } from "react";

type ConfirmActionModalProps = {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmActionModal({
  title,
  description,
  confirmLabel,
  danger = false,
  onClose,
  onConfirm,
}: ConfirmActionModalProps) {
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, submitting]);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-primary/45 p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-action-title"
        className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <span className={`material-symbols-rounded text-[24px] ${danger ? "text-red-700" : "text-tertiary"}`} aria-hidden="true">
            {danger ? "warning" : "help"}
          </span>
          <div>
            <h2 id="confirm-action-title" className="font-heading text-base font-bold text-primary">{title}</h2>
            <p className="mt-2 text-xs leading-5 text-gray-700">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded border border-border bg-surface px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-neutral focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className={`rounded px-3 py-2 text-xs font-semibold text-on-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 ${danger ? "bg-red-700 hover:bg-red-800 focus-visible:outline-red-700" : "bg-tertiary hover:bg-emerald-700 focus-visible:outline-tertiary"}`}
          >
            {submitting ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
