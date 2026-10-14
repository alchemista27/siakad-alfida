"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@alfida/ui";

interface Period {
  id: string;
  unitName: string;
  label: string;
  isOpen: boolean;
  quota: number;
}

interface Candidate {
  id: string;
  registrationNumber: string;
  status: string;
  studentData: {
    fullName: string;
    gender: string;
    birthDate: string;
    nisn: string | null;
  } | null;
  guardianName: string;
  guardianPhone: string;
  observationBooking?: {
    observationSchedule: {
      date: string;
      startTime: string;
      endTime: string;
    };
  } | null;
  observationResult: {
    score: number;
    rank: number | null;
    notes: string | null;
  } | null;
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

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Score modal
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(85);
  const [notesInput, setNotesInput] = useState<string>("");

  useEffect(() => {
    async function loadPeriods() {
      try {
        const res = await fetch("/api/periods");
        if (res.ok) {
          const data = await res.json();
          setPeriods(data);
          if (data.length > 0) {
            setSelectedPeriodId(data[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadPeriods();
  }, []);

  const fetchData = async () => {
    if (!selectedPeriodId) return;
    setLoading(true);
    setMessage(null);

    try {
      if (activeTab === "assess") {
        const res = await fetch(`/api/registrations?periodId=${selectedPeriodId}`);
        if (res.ok) {
          const data = await res.json();
          // Filter candidate for observation: observation_scheduled, observation_done, verification, etc.
          setCandidates(data);
        }
      } else {
        const res = await fetch(`/api/observations/rankings/${selectedPeriodId}`);
        if (res.ok) {
          const data = await res.json();
          setRankings(data);
        }
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Gagal memuat data observasi", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriodId, activeTab]);

  const handleOpenScoreModal = (candidate: Candidate) => {
    setActiveCandidate(candidate);
    setScoreInput(candidate.observationResult?.score || 80);
    setNotesInput(candidate.observationResult?.notes || "");
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCandidate) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/observations/submit-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: activeCandidate.id,
          score: Number(scoreInput),
          notes: notesInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gagal menyimpan hasil penilaian");

      setMessage({
        text: `Penilaian untuk ${activeCandidate.studentData?.fullName || "santri"} berhasil disimpan (Skor: ${scoreInput})`,
        type: "success",
      });
      setActiveCandidate(null);
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F8] text-[#454545] font-body flex flex-col justify-between">
      {/* Header Bar */}
      <header className="h-[60px] bg-white border-b border-[#E3E8E7] sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <a
            href="https://auth.alfida.or.id/modules"
            className="flex items-center gap-2 text-[#0f7f6d] font-bold text-lg font-heading"
          >
            <span className="material-symbols-rounded text-[#0f7f6d] text-[24px]">
              hub
            </span>
            <span>SIM-Alfida</span>
          </a>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#e6f4f1] text-[#0f7f6d]">
            Portal Penguji Observasi (Observer)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/admin"
            className="text-xs text-tertiary hover:underline font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-rounded text-[16px]">admin_panel_settings</span>
            <span>Portal Admin</span>
          </a>
          <a
            href="https://auth.alfida.or.id/api/auth/logout"
            className="text-xs text-gray-500 hover:text-red-600 px-2.5 py-1 rounded border border-border bg-white"
          >
            Keluar
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Title & Filter Gelombang */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5 bg-white p-6 rounded-xl border shadow-sm">
          <div>
            <div className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[10px] rounded-full mb-1">
              INSTRUMEN PENILAIAN SELEKSI SANTRI BARU
            </div>
            <h1 className="text-2xl font-bold font-heading text-primary">
              Penilaian & Observasi Calon Santri
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Input skor tes observasi (kemampuan membaca Al-Quran, kesiapan belajar, dan wawancara wali murid).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Pilih Gelombang PPDB:
              </label>
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="px-3 py-2 text-xs rounded border border-border bg-white focus:ring-2 focus:ring-[#0f7f6d] outline-none font-semibold text-primary"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.unitName} - {p.label} {p.isOpen ? "(Buka)" : "(Tutup)"}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="mt-5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-rounded text-[16px]">refresh</span>
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2 shadow-sm ${
              message.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <span className="material-symbols-rounded text-[20px]">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Navigasi */}
        <div className="flex items-center gap-2 border-b border-border text-xs font-semibold">
          <button
            onClick={() => setActiveTab("assess")}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === "assess"
                ? "border-tertiary text-tertiary font-bold"
                : "border-transparent text-gray-500 hover:text-primary"
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">assignment_turned_in</span>
            <span>Daftar Peserta Observasi</span>
          </button>
          <button
            onClick={() => setActiveTab("rankings")}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === "rankings"
                ? "border-tertiary text-tertiary font-bold"
                : "border-transparent text-gray-500 hover:text-primary"
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">leaderboard</span>
            <span>Rekapitulasi Peringkat Seleksi</span>
          </button>
        </div>

        {/* Konten Tab */}
        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-border">
            <span className="material-symbols-rounded animate-spin text-[32px] text-tertiary mb-2 block mx-auto">
              progress_activity
            </span>
            <p className="text-xs">Memuat data santri...</p>
          </div>
        ) : activeTab === "assess" ? (
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F7F8F8] border-b border-border text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">No. Pendaftaran</th>
                    <th className="py-3 px-4">Nama Calon Santri</th>
                    <th className="py-3 px-4">Wali Santri & Kontak</th>
                    <th className="py-3 px-4 text-center">Status Skor</th>
                    <th className="py-3 px-4 text-right">Aksi Penguji</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        Tidak ada pendaftar pada gelombang ini.
                      </td>
                    </tr>
                  ) : (
                    candidates.map((c) => {
                      const hasScore = c.observationResult !== null;

                      return (
                        <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                            {c.registrationNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-primary">
                              {c.studentData?.fullName || "Belum Mengisi Nama"}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              {c.studentData?.gender === "male" ? "Laki-laki" : "Perempuan"} | NISN:{" "}
                              {c.studentData?.nisn || "-"}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            <div>{c.guardianName}</div>
                            <div className="text-[11px] text-gray-400">{c.guardianPhone}</div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {hasScore ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-100 text-emerald-800">
                                <span>Skor: {Number(c.observationResult?.score)}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500">
                                Belum Dinilai
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenScoreModal(c)}
                              className="px-3 py-1.5 rounded bg-tertiary hover:bg-[#0b6355] text-white font-semibold text-xs transition-colors inline-flex items-center gap-1 shadow-sm"
                            >
                              <span className="material-symbols-rounded text-[16px]">edit_note</span>
                              <span>{hasScore ? "Ubah Nilai" : "Input Nilai"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F7F8F8] border-b border-border text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4 text-center w-16">Peringkat</th>
                    <th className="py-3 px-4">No. Pendaftaran</th>
                    <th className="py-3 px-4">Nama Calon Santri</th>
                    <th className="py-3 px-4 text-center">Skor Akhir</th>
                    <th className="py-3 px-4">Catatan Observasi</th>
                    <th className="py-3 px-4 text-center">Status Keputusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rankings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        Belum ada peserta yang dinilai pada gelombang ini.
                      </td>
                    </tr>
                  ) : (
                    rankings.map((r) => (
                      <tr key={r.registrationId} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-sm">
                          <span
                            className={`inline-block w-7 h-7 rounded-full text-center leading-7 font-mono ${
                              r.rank === 1
                                ? "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold"
                                : r.rank === 2
                                ? "bg-gray-200 text-gray-800"
                                : r.rank === 3
                                ? "bg-orange-100 text-orange-900"
                                : "bg-gray-50 text-gray-600"
                            }`}
                          >
                            {r.rank}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                          {r.registrationNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-primary">
                          {r.studentName}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-tertiary">
                          {r.score}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">
                          {r.notes || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              r.status === "accepted"
                                ? "bg-emerald-100 text-emerald-800"
                                : r.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Input Nilai Observasi */}
        {activeCandidate && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-heading font-bold text-base text-primary">
                  Formulir Penilaian Observasi
                </h3>
                <button
                  onClick={() => setActiveCandidate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-rounded text-[20px]">close</span>
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs space-y-1">
                <div>
                  <span className="text-gray-400">Nama Santri:</span>{" "}
                  <strong>{activeCandidate.studentData?.fullName || "Belum Ada Nama"}</strong>
                </div>
                <div>
                  <span className="text-gray-400">No. Registrasi:</span>{" "}
                  <span className="font-mono">{activeCandidate.registrationNumber}</span>
                </div>
              </div>

              <form onSubmit={handleSubmitScore} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Skor Observasi (0 - 100) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={scoreInput}
                    onChange={(e) => setScoreInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm font-bold font-mono rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="Contoh: 85"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Akumulasi tes kemampuan baca Al-Quran, kesiapan motorik/kognitif, dan wawancara orang tua.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Catatan Deskriptif / Rekomendasi
                  </label>
                  <textarea
                    rows={3}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="Contoh: Bacaan Al-Quran tartil, hafalan juz 30 lancar, siap mandiri."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setActiveCandidate(null)}
                    className="px-4 py-2 rounded border border-border text-xs text-gray-600 hover:bg-gray-50 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded bg-tertiary hover:bg-[#0b6355] text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : "Simpan Nilai Observasi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-500 border-t border-border bg-white mt-12">
        Hak Cipta &copy; {new Date().getFullYear()} Yayasan Alfida. Sistem SPMB.
      </footer>
    </div>
  );
}
