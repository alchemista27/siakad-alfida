"use client";

import React, { useEffect, useState } from "react";
import { AdminNotice, type AdminNoticeState } from "@/components/admin/admin-notice";
import {
  ObserverWorklist,
  type ObserverCandidateItem,
} from "@/components/observer/observer-worklist";
import { ObserverScoreModal } from "@/components/observer/observer-score-modal";

interface Period {
  id: string;
  unitName: string;
  label: string;
  isOpen: boolean;
  quota: number;
}

interface RankingItem {
  rank: number;
  registrationId: string;
  registrationNumber: string;
  studentName: string;
  score: number;
  notes: string | null;
  status: string;
}

export default function ObserverPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"assess" | "rankings">("assess");
  const [candidates, setCandidates] = useState<ObserverCandidateItem[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<AdminNoticeState | null>(null);
  const [activeCandidate, setActiveCandidate] = useState<ObserverCandidateItem | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(85);
  const [notesInput, setNotesInput] = useState<string>("");

  useEffect(() => {
    async function loadPeriods() {
      try {
        const res = await fetch("/api/periods");
        if (res.ok) {
          const data = await res.json();
          setPeriods(data);
          if (data.length > 0) setSelectedPeriodId(data[0].id);
        }
      } catch {
        setNotice({ type: "error", message: "Gagal memuat daftar periode." });
      }
    }
    loadPeriods();
  }, []);

  const fetchData = async () => {
    if (!selectedPeriodId) return;
    setLoading(true);
    try {
      if (activeTab === "assess") {
        const res = await fetch(`/api/observers/me/worklist?periodId=${encodeURIComponent(selectedPeriodId)}`);
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.message || "Gagal memuat daftar kerja penguji.");
        setCandidates(Array.isArray(data) ? data : []);
      } else {
        const res = await fetch(`/api/observers/me/rankings?periodId=${encodeURIComponent(selectedPeriodId)}`);
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.message || "Gagal memuat peringkat observasi.");
        setRankings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setNotice({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal memuat data observasi.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriodId, activeTab]);

  const handleOpenScoreModal = (candidate: ObserverCandidateItem) => {
    setActiveCandidate(candidate);
    setScoreInput(candidate.observationResult?.score ?? 80);
    setNotesInput(candidate.observationResult?.notes ?? "");
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCandidate) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/observers/me/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: activeCandidate.id,
          score: Number(scoreInput),
          notes: notesInput.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Gagal menyimpan hasil penilaian.");
      setNotice({
        type: "success",
        message: `Penilaian untuk ${activeCandidate.studentData?.fullName || "calon santri"} berhasil disimpan.`,
      });
      setActiveCandidate(null);
      await fetchData();
    } catch (err) {
      setNotice({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal menyimpan penilaian.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F8] text-[#454545] font-body flex flex-col justify-between">
      <header className="h-[60px] bg-white border-b border-[#E3E8E7] sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-heading font-bold text-lg text-[#0f7f6d]">SPMB · Portal Penguji Observasi</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-xs font-semibold text-[#0f7f6d] hover:underline">
            Portal Admin
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-5">
        <div className="bg-white border border-[#E3E8E7] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-xl text-[#454545]">Penilaian & Observasi Calon Santri</h1>
            <p className="text-xs text-gray-500 mt-1">
              Daftar kandidat terbatas pada unit tempat Anda ditugaskan sebagai penguji.
            </p>
          </div>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="px-3 py-2 text-xs rounded border border-[#E3E8E7] bg-white font-semibold"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.unitName} · {p.label}
              </option>
            ))}
          </select>
        </div>

        <AdminNotice notice={notice} onDismiss={() => setNotice(null)} />

        <div className="flex gap-2 border-b border-[#E3E8E7] pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("assess")}
            className={`px-3 py-1.5 rounded ${activeTab === "assess" ? "bg-[#0f7f6d] text-white" : "bg-white border border-[#E3E8E7]"}`}
          >
            Daftar Kandidat Observasi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rankings")}
            className={`px-3 py-1.5 rounded ${activeTab === "rankings" ? "bg-[#0f7f6d] text-white" : "bg-white border border-[#E3E8E7]"}`}
          >
            Peringkat Hasil Observasi
          </button>
        </div>

        {loading ? (
          <div className="bg-white border border-[#E3E8E7] rounded-lg p-8 text-center text-xs text-gray-500">
            Memuat data observasi...
          </div>
        ) : activeTab === "assess" ? (
          <ObserverWorklist candidates={candidates} onSelectCandidate={handleOpenScoreModal} />
        ) : (
          <div className="bg-white border border-[#E3E8E7] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F8] border-b border-[#E3E8E7] text-[11px] uppercase text-gray-500">
                <tr>
                  <th className="py-3 px-4">Peringkat</th>
                  <th className="py-3 px-4">No. Registrasi</th>
                  <th className="py-3 px-4">Nama Santri</th>
                  <th className="py-3 px-4 text-center">Skor</th>
                  <th className="py-3 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8E7]">
                {rankings.map((item) => (
                  <tr key={item.registrationId}>
                    <td className="py-3 px-4 font-bold">#{item.rank}</td>
                    <td className="py-3 px-4 font-mono">{item.registrationNumber}</td>
                    <td className="py-3 px-4 font-semibold">{item.studentName}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#0f7f6d]">{item.score}</td>
                    <td className="py-3 px-4 text-gray-600">{item.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <ObserverScoreModal
        candidate={activeCandidate}
        score={scoreInput}
        notes={notesInput}
        submitting={submitting}
        onScoreChange={setScoreInput}
        onNotesChange={setNotesInput}
        onClose={() => setActiveCandidate(null)}
        onSubmit={handleSubmitScore}
      />
    </div>
  );
}
