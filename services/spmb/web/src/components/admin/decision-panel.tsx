"use client";

import { useState } from "react";

export interface DecisionCandidate {
  id: string;
  registrationNumber: string;
  status: string;
  handoffStatus?: string;
  studentData?: { fullName: string } | null;
  observationResult?: { score: number; rank: number | null; notes: string | null } | null;
}

export function DecisionPanel({
  candidates,
  onChanged,
  onNotify,
}: {
  candidates: DecisionCandidate[];
  onChanged: () => Promise<void>;
  onNotify: (type: "success" | "error", message: string) => void;
}) {
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const decide = async (registrationId: string, status: "accepted" | "rejected") => {
    setBusyId(registrationId);
    try {
      const res = await fetch("/api/decisions/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId,
          status,
          notes: notesById[registrationId]?.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Gagal menetapkan keputusan kelulusan.");
      await onChanged();
      onNotify(
        "success",
        status === "accepted"
          ? "Pendaftar dinyatakan DITERIMA dan dijadwalkan untuk handoff SIAKAD."
          : "Pendaftar dinyatakan TIDAK LULUS.",
      );
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Gagal menetapkan keputusan.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="bg-white border border-[#E3E8E7] rounded-lg p-5 space-y-4">
      <div>
        <h3 className="font-heading font-bold text-base text-[#454545]">Keputusan Akhir Kelulusan (Admin Unit)</h3>
        <p className="text-xs text-gray-500 mt-1">
          Tetapkan kelulusan kandidat yang telah selesai observasi. Alasan wajib diisi saat menolak kandidat.
        </p>
      </div>
      <div className="space-y-3">
        {candidates.map((item) => (
          <div key={item.id} className="border border-[#E3E8E7] rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-[#454545]">
                {item.registrationNumber} · {item.studentData?.fullName || "Calon Murid"}
              </p>
              <p className="text-gray-500">
                Skor Observasi: {item.observationResult?.score ?? "-"} · Status: {item.status}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                placeholder="Catatan / alasan keputusan"
                value={notesById[item.id] || ""}
                onChange={(e) => setNotesById((prev) => ({ ...prev, [item.id]: e.target.value }))}
                className="px-2.5 py-1 border border-[#E3E8E7] rounded text-xs"
              />
              <button
                type="button"
                disabled={busyId === item.id}
                onClick={() => decide(item.id, "accepted")}
                className="px-3 py-1 bg-[#0f7f6d] text-white rounded font-semibold"
              >
                Terima
              </button>
              <button
                type="button"
                disabled={busyId === item.id}
                onClick={() => decide(item.id, "rejected")}
                className="px-3 py-1 border border-red-200 text-red-700 rounded font-semibold"
              >
                Tolak
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
