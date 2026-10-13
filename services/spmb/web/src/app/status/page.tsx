"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SpmbNavbar } from "@/components/SpmbNavbar";

interface TrackData {
  registrationId: string;
  registrationNumber: string;
  unitName: string;
  unitSlug: string;
  periodLabel: string;
  studentName: string;
  status: string;
  source: string;
  fee: number;
  bankName: string | null;
  bankNumber: string | null;
  bankHolder: string | null;
  payment: {
    status: string;
    amount: number;
    proofUrl: string | null;
  } | null;
  observationSchedule: {
    date: string;
    startTime: string;
    endTime: string;
  } | null;
  observationResult: {
    score: number;
    rank: number | null;
  } | null;
  handoffStatus: string;
  events: Array<{
    toStatus: string;
    kind: string;
    note: string | null;
    createdAt: string;
  }>;
}

function StatusTrackerContent() {
  const searchParams = useSearchParams();
  const initialReg = searchParams.get("registrationNumber") || "";

  const [regNumber, setRegNumber] = useState(initialReg);
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`/api/registrations/track/${encodeURIComponent(num.trim())}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Nomor pendaftaran tidak ditemukan");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReg) {
      fetchStatus(initialReg);
    }
  }, [initialReg]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(regNumber);
  };

  const getStepProgress = (status: string) => {
    switch (status) {
      case "pending_payment":
        return 1;
      case "payment_uploaded":
      case "payment_verified":
        return 2;
      case "form_filling":
      case "documents_uploaded":
      case "medical_pending":
      case "verification":
        return 3;
      case "observation_scheduled":
      case "observation_done":
        return 4;
      case "accepted":
      case "rejected":
      case "enrolled":
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F8]">
      <SpmbNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Pelacak Status Pendaftaran
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Masukkan nomor registrasi resmi Anda untuk memeriksa tahap proses dan pengumuman.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 max-w-md mx-auto flex gap-2">
            <input
              type="text"
              required
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="Contoh: PPDB-SD-2026-0001"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#06bfa2] bg-white shadow-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#06bfa2] hover:bg-[#05a88e] text-white font-semibold text-sm rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? "Mencari..." : "Lacak"}
            </button>
          </form>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-[#06bfa2] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Mencari data pendaftaran...</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-6 text-center max-w-md mx-auto">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm">Data Tidak Ditemukan</h3>
            <p className="text-xs mt-1 text-rose-700">{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Kartu Kelulusan Khusus (Accepted) */}
            {data.status === "accepted" && (
              <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center font-black text-xl">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-emerald-200">
                      PENGUMUMAN RESMI
                    </span>
                    <h2 className="text-2xl font-black">SELAMAT, ANDA DITERIMA!</h2>
                  </div>
                </div>
                <p className="text-sm text-emerald-100 leading-relaxed mb-6">
                  Calon santri/siswa <strong>{data.studentName}</strong> dinyatakan memenuhi seluruh kriteria seleksi dan resmi DITERIMA di <strong>{data.unitName}</strong> untuk tahun ajaran {data.periodLabel}.
                </p>

                <div className="pt-4 border-t border-emerald-600 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-emerald-100">
                    Silakan lanjutkan proses ke Sistem Akademik (SIAKAD) untuk data kelas dan informasi daftar ulang.
                  </div>
                  <a
                    href="https://siakad.alfida.or.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold text-sm hover:bg-emerald-50 shadow-md transition-all"
                  >
                    Lanjutkan ke SIAKAD
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            )}

            {/* Kartu Status Penolakan */}
            {data.status === "rejected" && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-gray-800">
                <h2 className="text-lg font-bold text-rose-900 mb-2">Pemberitahuan Seleksi</h2>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Mohon maaf, berdasarkan hasil observasi dan evaluasi daya tampung kuota di {data.unitName}, calon siswa {data.studentName} belum dapat kami terima pada gelombang ini. Kami mendoakan yang terbaik untuk masa depan ananda.
                </p>
              </div>
            )}

            {/* Detail Ringkas */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
                <div>
                  <span className="text-xs text-gray-500 font-medium">Nomor Registrasi</span>
                  <div className="text-xl font-black text-gray-900 tracking-wide">
                    {data.registrationNumber}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 font-medium">Status</span>
                  <div className="text-sm font-bold text-[#0f7f6d] uppercase bg-teal-50 px-3 py-1 rounded-full inline-block">
                    {data.status.replace(/_/g, " ")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-600 mb-6">
                <div>
                  <span className="text-gray-400 block mb-0.5">Nama Calon Siswa</span>
                  <span className="font-bold text-gray-900 text-sm">{data.studentName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Unit Tujuan</span>
                  <span className="font-bold text-gray-900 text-sm">{data.unitName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Periode Gelombang</span>
                  <span className="font-bold text-gray-900 text-sm">{data.periodLabel}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Jalur Pendaftaran</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {data.source === "offline" ? "Luring (Offline)" : "Daring (Online)"}
                  </span>
                </div>
                {data.observationSchedule && (
                  <div>
                    <span className="text-gray-400 block mb-0.5">Jadwal Observasi</span>
                    <span className="font-semibold text-gray-800">
                      {data.observationSchedule.date} ({data.observationSchedule.startTime})
                    </span>
                  </div>
                )}
                {data.observationResult && (
                  <div>
                    <span className="text-gray-400 block mb-0.5">Skor Observasi</span>
                    <span className="font-semibold text-gray-800">
                      {data.observationResult.score} (Peringkat: {data.observationResult.rank || "-"})
                    </span>
                  </div>
                )}
              </div>

              {/* Step Tracker Visual */}
              <div className="pt-4 border-t border-gray-100">
                <div className="text-xs font-bold text-gray-700 mb-3">Progress Seleksi</div>
                <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                  {[
                    { step: 1, label: "Registrasi" },
                    { step: 2, label: "Biaya" },
                    { step: 3, label: "Berkas" },
                    { step: 4, label: "Observasi" },
                    { step: 5, label: "Hasil" },
                  ].map((s) => {
                    const currentStep = getStepProgress(data.status);
                    const isDone = currentStep >= s.step;
                    const isCurrent = currentStep === s.step;

                    return (
                      <div key={s.step} className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                            isDone
                              ? "bg-[#06bfa2] text-white"
                              : "bg-gray-200 text-gray-500"
                          } ${isCurrent ? "ring-2 ring-teal-300 ring-offset-2" : ""}`}
                        >
                          {isDone ? "✓" : s.step}
                        </div>
                        <span
                          className={`font-semibold ${
                            isDone ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Riwayat Linimasa */}
            {data.events.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-sm text-gray-900 mb-4">Riwayat Aktivitas Pendaftaran</h3>
                <div className="space-y-4">
                  {data.events.map((evt, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#06bfa2] mt-1.5 shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {evt.note || `Status berubah menjadi ${evt.toStatus}`}
                        </div>
                        <div className="text-gray-400 text-[11px] mt-0.5">
                          {new Date(evt.createdAt).toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function StatusTrackerPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8F8]">
          <div className="w-8 h-8 border-4 border-[#06bfa2] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <StatusTrackerContent />
    </React.Suspense>
  );
}

