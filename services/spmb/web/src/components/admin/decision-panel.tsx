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
  const [revisionCandidate, setRevisionCandidate] = useState<DecisionCandidate | null>(null);

  const decisionCandidates = candidates.filter((item) =>
    ["observation_done", "accepted", "rejected"].includes(item.status),
  );

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
      setRevisionCandidate(null);
      onNotify(
        "success",
        status === "accepted"
          ? "Keputusan diterima tersimpan. Handoff SIAKAD dijadwalkan."
          : "Keputusan tidak lulus tersimpan.",
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
          Tetapkan kelulusan setelah observasi selesai. Keputusan yang sudah tersimpan dapat direvisi sebelum handoff SIAKAD selesai.
        </p>
      </div>

      {decisionCandidates.length === 0 ? (
        <div className="rounded-sm border border-[#E3E8E7] bg-[#F7F8F8] px-3 py-4 text-xs text-gray-600">
          Belum ada pendaftar yang siap atau memiliki keputusan akhir.
        </div>
      ) : (
        <div className="space-y-3">
          {decisionCandidates.map((item) => {
            const isInitialDecision = item.status === "observation_done";
            const isFinalized = item.status === "accepted" || item.status === "rejected";
            const isHandoffCompleted = item.handoffStatus === "done";
            const decisionLabel = item.status === "accepted" ? "Diterima" : "Tidak lulus";

            return (
              <div key={item.id} className="border border-[#E3E8E7] rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-[#454545]">
                    {item.registrationNumber} · {item.studentData?.fullName || "Calon Murid"}
                  </p>
                  <p className="text-gray-500">
                    Skor Observasi: {item.observationResult?.score ?? "-"} · Status: {item.status}
                  </p>
                  {isFinalized && (
                    <p className={item.status === "accepted" ? "mt-1 font-semibold text-[#0f7f6d]" : "mt-1 font-semibold text-red-700"}>
                      Keputusan tersimpan: {decisionLabel}
                    </p>
                  )}
                  {isHandoffCompleted && (
                    <p className="mt-1 text-[11px] text-gray-500">
                      Keputusan dikunci karena handoff SIAKAD sudah selesai.
                    </p>
                  )}
                </div>

                {isInitialDecision && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      placeholder="Catatan / alasan keputusan"
                      value={notesById[item.id] || ""}
                      onChange={(event) => setNotesById((prev) => ({ ...prev, [item.id]: event.target.value }))}
                      className="px-2.5 py-1 border border-[#E3E8E7] rounded-sm text-xs"
                    />
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void decide(item.id, "accepted")}
                      className="px-3 py-1 bg-[#0f7f6d] text-white rounded-sm font-semibold disabled:opacity-50"
                    >
                      Terima
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void decide(item.id, "rejected")}
                      className="px-3 py-1 border border-red-200 text-red-700 rounded-sm font-semibold disabled:opacity-50"
                    >
                      Tolak
                    </button>
                  </div>
                )}

                {isFinalized && !isHandoffCompleted && (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => setRevisionCandidate(item)}
                    className="px-3 py-1 border border-[#0f7f6d] text-[#0f7f6d] rounded-sm font-semibold disabled:opacity-50"
                  >
                    Revisi Keputusan
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {revisionCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="revision-decision-title">
          <div className="w-full max-w-md rounded-lg border border-[#E3E8E7] bg-white p-5 space-y-4">
            <div>
              <h4 id="revision-decision-title" className="font-heading text-base font-bold text-[#454545]">Revisi Keputusan</h4>
              <p className="mt-1 text-xs text-gray-600">
                {revisionCandidate.registrationNumber} · {revisionCandidate.studentData?.fullName || "Calon Murid"}
              </p>
            </div>
            <p className="rounded-sm border border-[#E3E8E7] bg-[#F7F8F8] p-3 text-xs text-gray-600">
              Keputusan saat ini: <strong>{revisionCandidate.status === "accepted" ? "Diterima" : "Tidak lulus"}</strong>. Riwayat keputusan tetap tercatat.
            </p>
            <input
              autoFocus
              placeholder="Catatan revisi / alasan penolakan"
              value={notesById[revisionCandidate.id] || ""}
              onChange={(event) => setNotesById((prev) => ({ ...prev, [revisionCandidate.id]: event.target.value }))}
              className="w-full px-3 py-2 border border-[#E3E8E7] rounded-sm text-xs"
            />
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={busyId === revisionCandidate.id}
                onClick={() => setRevisionCandidate(null)}
                className="px-3 py-1.5 border border-[#E3E8E7] rounded-sm text-xs font-semibold disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={busyId === revisionCandidate.id}
                onClick={() => void decide(revisionCandidate.id, "accepted")}
                className="px-3 py-1.5 bg-[#0f7f6d] text-white rounded-sm text-xs font-semibold disabled:opacity-50"
              >
                Ubah menjadi Diterima
              </button>
              <button
                type="button"
                disabled={busyId === revisionCandidate.id}
                onClick={() => void decide(revisionCandidate.id, "rejected")}
                className="px-3 py-1.5 border border-red-200 text-red-700 rounded-sm text-xs font-semibold disabled:opacity-50"
              >
                Ubah menjadi Tidak Lulus
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
