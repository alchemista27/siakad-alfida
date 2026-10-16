"use client";

import { useEffect, useState } from "react";

interface RevisionNoteModalProps {
  isOpen: boolean;
  title?: string;
  submitLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => Promise<void> | void;
}

export function RevisionNoteModal({
  isOpen,
  title = "Minta Revisi",
  submitLabel = "Kirim Permintaan Revisi",
  loading = false,
  onClose,
  onSubmit,
}: RevisionNoteModalProps) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNotes("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!notes.trim()) {
      setError("Catatan revisi wajib diisi agar PIC atau Admin Biro dapat menindaklanjuti.");
      return;
    }
    await onSubmit(notes.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="revision-title">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-border bg-surface p-5">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
          <div>
            <h2 id="revision-title" className="font-heading text-base font-bold text-primary">{title}</h2>
            <p className="mt-1 text-xs text-gray-500">Jelaskan bagian yang perlu diperbaiki sebelum pengajuan berikutnya.</p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} className="text-gray-500 hover:text-primary" aria-label="Tutup">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>
        <label className="mt-4 block text-xs font-semibold text-primary" htmlFor="revision-notes">Catatan revisi *</label>
        <textarea
          id="revision-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary outline-none focus:ring-2 focus:ring-tertiary"
          placeholder="Contoh: Tambahkan indikator dan bukti target yang terukur."
        />
        {error && <p className="mt-2 text-xs text-red-700" role="alert">{error}</p>}
        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <button type="button" onClick={onClose} disabled={loading} className="rounded-sm border border-border px-4 py-2 text-xs font-semibold text-primary hover:bg-neutral">Batal</button>
          <button type="submit" disabled={loading} className="rounded-sm bg-tertiary px-4 py-2 text-xs font-semibold text-on-tertiary hover:bg-emerald-700 disabled:opacity-50">
            {loading ? "Mengirim..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
