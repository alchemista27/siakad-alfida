"use client";

import { Button } from "@alfida/ui";

type ConfirmActionModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmActionModal({
  isOpen,
  title,
  description,
  confirmLabel = "Konfirmasi",
  isDestructive = false,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: ConfirmActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-action-title">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-5">
        <h2 id="confirm-action-title" className="font-heading text-lg font-bold text-primary">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={isSubmitting}>Batalkan</Button>
          <Button type="button" variant={isDestructive ? "danger" : "primary"} size="sm" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
