"use client";

import React, { useState, useEffect } from "react";
import { SimakinShell } from "@/components/simakin-shell";
import {
  getTrafficLightDashboard,
  getDashboardSummary,
  getDepartments,
} from "@/actions/strategic";
import { Badge, EmptyState, LoadingState, ErrorState } from "@alfida/ui";

interface DepartmentTraffic {
  departmentId: string;
  departmentName: string;
  totalKpis: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  averageProgress: number;
}

export default function ExecutiveDashboardPage() {
  const [trafficData, setTrafficData] = useState<DepartmentTraffic[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [traffic, sum, depts] = await Promise.all([
        getTrafficLightDashboard().catch(() => []),
        getDashboardSummary().catch(() => null),
        getDepartments().catch(() => []),
      ]);

      setTrafficData(Array.isArray(traffic) ? traffic : []);
      setSummary(sum);
      setDepartments(Array.isArray(depts) ? depts : []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat dasbor eksekutif");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalKpis = summary?.totalKpis || 0;
  const avgAchievement = summary?.averageAchievement || 0;

  return (
    <SimakinShell activePath="/executive">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border gap-4">
          <div>
            <div className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full mb-1">
              PORTAL EKSEKUTIF PIMPINAN & PENGAWAS
            </div>
            <h1 className="text-2xl font-bold font-heading text-primary">
              Evaluasi Kinerja Eksekutif Yayasan
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Matriks pemantauan agregat capaian kinerja antar-bidang (Bird-Eye View) dan indikator lampu lalu lintas (Traffic Light)
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Indikator KPI
            </div>
            <div className="mt-2 text-3xl font-bold font-heading text-primary">{totalKpis}</div>
            <div className="mt-1 text-[11px] text-gray-500">Seluruh unit yayasan</div>
          </div>

          <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Rata-rata Capaian
            </div>
            <div className="mt-2 text-3xl font-bold font-heading text-tertiary">
              {Math.round(avgAchievement)}%
            </div>
            <div className="mt-1 text-[11px] text-gray-500">Indeks kinerja menyeluruh</div>
          </div>

          <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Bidang On-Track (Hijau)
            </div>
            <div className="mt-2 text-3xl font-bold font-heading text-emerald-600">
              {trafficData.filter((t) => t.averageProgress >= 80).length}
            </div>
            <div className="mt-1 text-[11px] text-gray-500">Capaian &gt;= 80%</div>
          </div>

          <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Perlu Perhatian (Merah)
            </div>
            <div className="mt-2 text-3xl font-bold font-heading text-red-600">
              {trafficData.filter((t) => t.averageProgress < 50).length}
            </div>
            <div className="mt-1 text-[11px] text-gray-500">Capaian &lt; 50%</div>
          </div>
        </div>

        {/* Content Section: Matriks Traffic Light */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold font-heading text-primary">
              Matriks Kinerja Per Bidang (Traffic Light Report)
            </h2>
          </div>

          {loading ? (
            <LoadingState message="Memuat evaluasi eksekutif..." />
          ) : error ? (
            <ErrorState
              title="Gagal Memuat Evaluasi"
              message={error}
              onRetry={fetchData}
            />
          ) : trafficData.length === 0 ? (
            <EmptyState
              title="Belum Ada Data Evaluasi"
              description="Belum ada data capaian KPI yang cukup untuk membentuk visualisasi Traffic Light."
            />
          ) : (
            <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-xs text-left">
                  <thead className="bg-[#F7F8F8] text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Nama Bidang / Biro</th>
                      <th scope="col" className="px-6 py-3.5 text-center">Total KPI</th>
                      <th scope="col" className="px-6 py-3.5 text-center">Hijau</th>
                      <th scope="col" className="px-6 py-3.5 text-center">Kuning</th>
                      <th scope="col" className="px-6 py-3.5 text-center">Merah</th>
                      <th scope="col" className="px-6 py-3.5 text-center">Progres Rata-rata</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Laporan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {trafficData.map((t) => (
                      <tr key={t.departmentId} className="hover:bg-[#fafbfb] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-primary">{t.departmentName}</div>
                        </td>
                        <td className="px-6 py-4 text-center font-mono">
                          {t.totalKpis}
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-emerald-600">
                          {t.greenCount}
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-amber-600">
                          {t.yellowCount}
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-red-600">
                          {t.redCount}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                              t.averageProgress >= 80
                                ? "bg-emerald-100 text-emerald-800"
                                : t.averageProgress >= 50
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {Math.round(t.averageProgress)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a
                            href={`/api/strategic/kpis/export/excel?departmentId=${t.departmentId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-tertiary hover:bg-[#e6f4f1] rounded border border-emerald-200 transition-colors"
                          >
                            <span className="material-symbols-rounded text-[14px]">download</span>
                            <span>Excel</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </SimakinShell>
  );
}
