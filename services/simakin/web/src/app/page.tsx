"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Badge, EmptyState, LoadingState, ErrorState } from "@alfida/ui";
import { SimakinShell } from "@/components/simakin-shell";
import { getDepartments, getPrograms } from "@/actions/strategic";

interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
}

interface ProgramItem {
  id: string;
  title: string;
  description: string | null;
  status: "planned" | "ongoing" | "completed";
  priority: string;
  department?: { name: string };
  kpis?: Array<{ id: string; name: string; target: number; realization: number; unit: string }>;
}

export default function SimakinDashboardPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptData, progData] = await Promise.all([
        getDepartments().catch(() => []),
        getPrograms(selectedDeptId || undefined).catch(() => []),
      ]);

      setDepartments(Array.isArray(deptData) ? deptData : []);
      setPrograms(Array.isArray(progData) ? progData : []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data dari server SIMAKIN");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [selectedDeptId]);

  const totalPrograms = programs.length;
  const ongoingPrograms = programs.filter((p) => p.status === "ongoing").length;
  const completedPrograms = programs.filter((p) => p.status === "completed").length;

  return (
    <SimakinShell activePath="/">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-primary">
              Monitoring Kinerja & Program Kerja
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Pemantauan realisasi rencana kerja operasional dan target KPI unit Yayasan Alfida
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="px-3.5 py-2 border border-border rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] font-medium text-primary shadow-sm"
            >
              <option value="">Semua Bidang / Departemen</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <Link
              href="/programs"
              className="px-3.5 py-2 bg-tertiary hover:bg-[#0b6355] text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-rounded text-[16px]">add_circle</span>
              <span>Kelola Program</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards (Wireframe 04-admin-dashboard.html) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          <div className="bg-white border border-border rounded-lg p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-[#e6f4f1] text-tertiary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-rounded text-[26px]">assignment</span>
            </div>
            <div>
              <div className="text-2xl font-bold font-heading text-primary">{totalPrograms}</div>
              <div className="text-xs text-gray-500 mt-0.5">Total Program Kerja</div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-rounded text-[26px]">pending_actions</span>
            </div>
            <div>
              <div className="text-2xl font-bold font-heading text-blue-700">{ongoingPrograms}</div>
              <div className="text-xs text-gray-500 mt-0.5">Sedang Berjalan</div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-rounded text-[26px]">check_circle</span>
            </div>
            <div>
              <div className="text-2xl font-bold font-heading text-emerald-700">{completedPrograms}</div>
              <div className="text-xs text-gray-500 mt-0.5">Telah Tuntas</div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold font-heading text-primary">
              Daftar Program Kerja & Indikator Capaian
            </h2>
            <Link
              href="/kpis"
              className="text-xs text-tertiary font-semibold hover:underline flex items-center gap-1"
            >
              <span>Lihat Matriks Capaian KPI</span>
              <span className="material-symbols-rounded text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <LoadingState message="Memuat program kerja dan indikator KPI..." />
          ) : error ? (
            <ErrorState
              title="Gagal Memuat Data"
              message={error}
              onRetry={fetchInitialData}
            />
          ) : programs.length === 0 ? (
            <EmptyState
              title="Belum Ada Program Kerja"
              description="Belum ada program kerja yang terdaftar untuk filter bidang yang dipilih."
            />
          ) : (
            <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-xs text-left">
                  <thead className="bg-[#F7F8F8] text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Nama Program</th>
                      <th scope="col" className="px-6 py-3.5">Bidang / Departemen</th>
                      <th scope="col" className="px-6 py-3.5">Prioritas</th>
                      <th scope="col" className="px-6 py-3.5">Status</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Indikator KPI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {programs.map((prog) => (
                      <tr key={prog.id} className="hover:bg-[#fafbfb] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-primary">{prog.title}</div>
                          {prog.description && (
                            <div className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                              {prog.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {prog.department?.name || "Yayasan Alfida"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-medium text-gray-600 capitalize px-2 py-0.5 rounded bg-gray-100">
                            {prog.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              prog.status === "completed"
                                ? "success"
                                : prog.status === "ongoing"
                                ? "info"
                                : "neutral"
                            }
                          >
                            {prog.status === "completed"
                              ? "Selesai"
                              : prog.status === "ongoing"
                              ? "Berjalan"
                              : "Direncanakan"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-[11px] text-tertiary font-semibold bg-[#e6f4f1] px-2.5 py-0.5 rounded-full">
                            {prog.kpis?.length || 0} Indikator
                          </span>
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
