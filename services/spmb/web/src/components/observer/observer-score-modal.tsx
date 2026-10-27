"use client";

import { FormEvent } from "react";
import type { ObserverCandidateItem } from "./observer-worklist";

export function ObserverScoreModal({
  candidate,
  score,
  notes,
  submitting,
  onScoreChange,
  onNotesChange,
  onClose,
  onSubmit,
}: {
  candidate: ObserverCandidateItem | null;
  score: number;
  notes: string;
  submitting: boolean;
  onScoreChange: (value: number) => void;
  onNotesChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 border border-[#E3E8E7]">
        <div className="flex items-center justify-between border-b border-[#E3E8E7] pb-3 mb-4">
          <h2 className="font-heading font-bold text-base text-[#454545]">Penilaian Observasi</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-[#F7F8F8] rounded border border-[#E3E8E7]">
            <p className="font-semibold text-[#454545]">{candidate.studentData?.fullName || "Calon Murid"}</p>
            <p className="text-gray-500 mt-0.5">No. Reg: {candidate.registrationNumber}</p>
          </div>
          <div>
            <label className="block font-semibold text-[#454545] mb-1">Skor Akhir Observasi (0 - 100)</label>
            <input
              type="number"
              min={0}
              max={100}
              required
              value={score}
              onChange={(e) => onScoreChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[#E3E8E7] rounded text-base font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#454545] mb-1">Catatan Penguji</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Ringkasan hasil bacaan, kesiapan belajar, dan wawancara..."
              className="w-full px-3 py-2 border border-[#E3E8E7] rounded"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#E3E8E7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E3E8E7] rounded font-semibold text-gray-600"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#0f7f6d] text-white rounded font-semibold hover:bg-[#0b6355]"
            >
              {submitting ? "Menyimpan..." : "Simpan Penilaian"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
