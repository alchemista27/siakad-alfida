"use client";

import { useEffect, useId } from "react";
import { Button } from "@alfida/ui";

export interface NotificationModalProps {
  open: boolean;
  title: string;
  message: string;
  tone?: "success" | "error" | "info";
  onClose: () => void;
}

export function NotificationModal({ open, title, message, tone = "info", onClose }: NotificationModalProps) {
  const headingId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const icon = tone === "success" ? "check_circle" : tone === "error" ? "error" : "info";
  const color = tone === "success" ? "text-tertiary" : tone === "error" ? "text-red-600" : "text-secondary";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-primary/30 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby={headingId} className="w-full max-w-md rounded-lg border border-border bg-surface p-5">
        <div className="flex gap-3">
          <span className={`material-symbols-rounded ${color}`} aria-hidden="true">{icon}</span>
          <div className="min-w-0 flex-1">
            <h2 id={headingId} className="font-heading text-lg font-bold text-primary">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-primary/75">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="button" onClick={onClose}>Tutup</Button>
        </div>
      </section>
    </div>
  );
}
