"use client";

import React, { useState, useEffect } from "react";
import { SimakinShell } from "@/components/simakin-shell";
import {
  getTrafficLightDashboard,
  getDashboardSummary,
  getProgressPerDepartment,
} from "@/actions/strategic";
import { EmptyState, LoadingState, ErrorState } from "@alfida/ui";

interface DepartmentProgress {
  departmentId: string;
  departmentName: string;
  totalPrograms: number;
  completedPrograms: number;
  averageProgress: number;
}

interface KpiDetail {
  id: string;
  name: string;
  target: number;
  realization: number;
  unit: string;
  achievementPercent: number;
  color: "green" | "yellow" | "red";
  program?: {
    id: string;
    title: string;
    department?: {
      name: string;
    };
  };
}

interface CriticalIssue {
  id: string;
  title: string;
  impactScore?: number;
  probabilityScore?: number;
  status: string;
  reporter?: {
    fullName: string;
  };
}

export default function ExecutiveDashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [deptProgress, setDeptProgress] = useState<DepartmentProgress[]>([]);
  const [trafficSummary, setTrafficSummary] = useState<{
    total: number;
    green: number;
    yellow: number;
    red: number;
  }>({ total: 0, green: 0, yellow: 0, red: 0 });
  const [kpiDetails, setKpiDetails] = useState<KpiDetail[]>([]);
  const [kpiFilter, setKpiFilter] = useState<"all" | "green" | "yellow" | "red">("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, progressRes, trafficRes] = await Promise.all([
        getDashboardSummary().catch(() => null),
        getProgressPerDepartment().catch(() => []),
        getTrafficLightDashboard().catch(() => null),
      ]);

      setSummary(sumRes);
      setDeptProgress(Array.isArray(progressRes) ? progressRes : []);

      if (trafficRes?.summary) {
        setTrafficSummary(trafficRes.summary);
      }
      if (Array.isArray(trafficRes?.details)) {
        setKpiDetails(trafficRes.details);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat dasbor eksekutif");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const programStats = summary?.programStats || { total: 0, completed: 0, progressPercent: 0 };
  const attendanceRate = summary?.attendanceRate ?? 0;
  const topIssues: CriticalIssue[] = summary?.topIssues || [];

  const filteredKpis = kpiDetails.filter((kpi) => {
    if (kpiFilter === "all") return true;
    return kpi.color === kpiFilter;
  });

  return (
    <SimakinShell activePath="/executive">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border gap-4">
          <div>
            <div className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full mb-1">
              PORTAL EKSEKUTIF PIMPINAN & PENGAWAS (BPH)
            </div>
            <h1 className="text-2xl font-bold font-heading text-primary">
              Dasbor Rekapitulasi Eksekutif Yayasan
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Pemantauan menyeluruh capaian kinerja program kerja, progres agregat per bidang, isu kritis, dan matriks Traffic Light KPI.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3 py-1.5 rounded border border-border bg-white hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto text-gray-600 shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-rounded text-[16px]">refresh</span>
            <span>Muat Ulang Data</span>
          </button>
        </div>

        {loading ? (
          <LoadingState message="Memuat dasbor eksekutif BPH..." />
        ) : error ? (
          <ErrorState title="Gagal Memuat Dasbor" message={error} onRetry={fetchData} />
        ) : (
          <>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Program Kerja */}
              <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Total Program Kerja
                  </div>
                  <div className="mt-2 text-3xl font-bold font-heading text-primary">
                    {programStats.total}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-gray-500">
                  <span>Selesai:</span>
                  <span className="font-bold text-tertiary">
                    {programStats.completed} dari {programStats.total} ({Math.round(programStats.progressPercent)}%)
                  </span>
                </div>
              </div>

              {/* Matriks Traffic Light KPI Summary */}
              <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Evaluasi Traffic Light KPI
                  </div>
                  <div className="mt-2 text-3xl font-bold font-heading text-primary">
                    {trafficSummary.total} <span className="text-sm font-normal text-gray-400">Indikator</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-3 text-xs font-semibold">
                  <span className="text-emerald-600">● {trafficSummary.green} Hijau</span>
                  <span className="text-amber-600">● {trafficSummary.yellow} Kuning</span>
                  <span className="text-rose-600">● {trafficSummary.red} Merah</span>
                </div>
              </div>

              {/* Tingkat Kehadiran Rapat */}
              <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Disiplin Rapat Kinerja
                  </div>
                  <div className="mt-2 text-3xl font-bold font-heading text-tertiary">
                    {attendanceRate}%
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border text-xs text-gray-500">
                  Rasio kehadiran PIC & peserta rapat
                </div>
              </div>

              {/* Isu Kritis */}
              <div className="bg-white border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Kendala Kritis (Issues)
                  </div>
                  <div className="mt-2 text-3xl font-bold font-heading text-red-600">
                    {topIssues.length}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border text-xs text-gray-500">
                  Isu berisiko tinggi belum terselesaikan
                </div>
              </div>
            </div>

            {/* Grid 2 Kolom: Progres per Bidang + Top Critical Issues */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kolom Kiri: Progress per Bidang / Biro */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-bold font-heading text-primary flex items-center gap-2">
                    <span className="material-symbols-rounded text-tertiary text-[20px]">
                      domain
                    </span>
                    <span>Progres Capaian per Bidang & Biro</span>
                  </h3>
                  <span className="text-xs text-gray-400">{deptProgress.length} Departemen</span>
                </div>

                {deptProgress.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    Belum ada data program kerja per departemen.
                  </p>
                ) : (
                  <div className="space-y-4 pt-1">
                    {deptProgress.map((dept) => (
                      <div key={dept.departmentId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-primary">{dept.departmentName}</span>
                          <span className="font-bold font-mono text-tertiary">
                            {dept.averageProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-border/50">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              dept.averageProgress >= 80
                                ? "bg-emerald-600"
                                : dept.averageProgress >= 50
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, dept.averageProgress))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-400">
                          <span>
                            {dept.completedPrograms} dari {dept.totalPrograms} program selesai
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kolom Kanan: Top Critical Issues */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-bold font-heading text-primary flex items-center gap-2">
                    <span className="material-symbols-rounded text-red-600 text-[20px]">
                      warning
                    </span>
                    <span>Kendala & Isu Kritis Prioritas</span>
                  </h3>
                  <span className="text-xs text-red-600 font-semibold">{topIssues.length} Isu</span>
                </div>

                {topIssues.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    <span className="material-symbols-rounded text-emerald-600 text-[36px] block mx-auto mb-1">
                      verified
                    </span>
                    <span>Tidak ada kendala kritis yang belum terselesaikan saat ini.</span>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {topIssues.map((issue) => {
                      const impact = issue.impactScore || 1;
                      const prob = issue.probabilityScore || 1;
                      const riskScore = impact * prob;

                      return (
                        <div key={issue.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                          <div>
                            <div className="font-semibold text-primary">{issue.title}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              Pelapor: {issue.reporter?.fullName || "PIC Program"} | Status:{" "}
                              <span className="uppercase text-[10px] font-semibold text-gray-600">
                                {issue.status}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              riskScore >= 16
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            Skor Risiko: {riskScore}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Section Bawah: Rincian Matriks Traffic Light KPI */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold font-heading text-primary flex items-center gap-2">
                    <span className="material-symbols-rounded text-tertiary text-[20px]">
                      traffic
                    </span>
                    <span>Rincian Performa Indikator KPI (Traffic Light Report)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Evaluasi capaian realisasi terhadap target indikator kinerja utama.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-[#F7F8F8] p-1 rounded-lg border border-border text-xs">
                  <button
                    onClick={() => setKpiFilter("all")}
                    className={`px-3 py-1 rounded font-semibold transition-all ${
                      kpiFilter === "all"
                        ? "bg-white text-primary shadow-xs"
                        : "text-gray-500 hover:text-primary"
                    }`}
                  >
                    Semua ({kpiDetails.length})
                  </button>
                  <button
                    onClick={() => setKpiFilter("green")}
                    className={`px-3 py-1 rounded font-semibold transition-all ${
                      kpiFilter === "green"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "text-gray-500 hover:text-emerald-700"
                    }`}
                  >
                    Hijau ({trafficSummary.green})
                  </button>
                  <button
                    onClick={() => setKpiFilter("yellow")}
                    className={`px-3 py-1 rounded font-semibold transition-all ${
                      kpiFilter === "yellow"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "text-gray-500 hover:text-amber-700"
                    }`}
                  >
                    Kuning ({trafficSummary.yellow})
                  </button>
                  <button
                    onClick={() => setKpiFilter("red")}
                    className={`px-3 py-1 rounded font-semibold transition-all ${
                      kpiFilter === "red"
                        ? "bg-rose-50 text-rose-800 border border-rose-200"
                        : "text-gray-500 hover:text-rose-700"
                    }`}
                  >
                    Merah ({trafficSummary.red})
                  </button>
                </div>
              </div>

              {filteredKpis.length === 0 ? (
                <EmptyState
                  title="Tidak Ada KPI Sesuai Filter"
                  description="Tidak ditemukan indikator KPI untuk kategori filter yang dipilih."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F7F8F8] border-b border-border text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Indikator KPI</th>
                        <th className="py-3 px-4">Program / Bidang</th>
                        <th className="py-3 px-4 text-center">Target</th>
                        <th className="py-3 px-4 text-center">Realisasi</th>
                        <th className="py-3 px-4 text-center">Capaian</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredKpis.map((kpi) => (
                        <tr key={kpi.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-primary">{kpi.name}</div>
                            <div className="text-[11px] text-gray-400">Satuan: {kpi.unit}</div>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            <div>{kpi.program?.title || "-"}</div>
                            <div className="text-[11px] text-gray-400">
                              {kpi.program?.department?.name || "-"}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-medium">
                            {kpi.target} {kpi.unit}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-medium">
                            {kpi.realization} {kpi.unit}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-mono font-bold">{kpi.achievementPercent}%</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                kpi.color === "green"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : kpi.color === "yellow"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {kpi.color === "green"
                                ? "On Track"
                                : kpi.color === "yellow"
                                ? "Perlu Perhatian"
                                : "Kritis"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SimakinShell>
  );
}
