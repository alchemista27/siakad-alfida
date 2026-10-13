"use client";

import React, { useState, useEffect } from "react";
import { Navbar, Card, Badge, Button, EmptyState, LoadingState, ErrorState } from "@alfida/ui";

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

  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [selectedDeptId]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Periksa sesi dari auth endpoint
      const meRes = await fetch("/api/auth/me").catch(() => null);
      if (meRes && meRes.ok) {
        const meData = await meRes.json();
        if (meData?.user) {
          setUser({
            fullName: meData.user.fullName,
            role: meData.user.roles?.[0]?.role || "Pengguna",
          });
        }
      }

      // Ambil data departemen
      const deptRes = await fetch("/api/strategic/departments");
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(Array.isArray(deptData) ? deptData : []);
      }

      // Ambil program kerja
      const url = selectedDeptId
        ? `/api/strategic/programs?departmentId=${selectedDeptId}`
        : "/api/strategic/programs";
      const progRes = await fetch(url);
      if (progRes.ok) {
        const progData = await progRes.json();
        setPrograms(Array.isArray(progData) ? progData : []);
      } else {
        setPrograms([]);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data dari server SIMAKIN");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("https://auth.alfida.or.id/api/auth/logout", { credentials: "include", method: "POST" });
    } catch (e) {}
    window.location.href = "https://auth.alfida.or.id/login";
  };

  const totalPrograms = programs.length;
  const ongoingPrograms = programs.filter((p) => p.status === "ongoing").length;
  const completedPrograms = programs.filter((p) => p.status === "completed").length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        serviceName="SIMAKIN (Kinerja & Program Kerja)"
        userName={user?.fullName || "Ahmad Fauzi"}
        userRole={user?.role || "PIC Program"}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Dashboard Program Kerja dan Capaian KPI
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Pemantauan realisasi rencana kerja operasional dan strategis Yayasan Alfida
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
            >
              <option value="">Semua Bidang / Biro</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          <Card className="border-emerald-100 bg-white">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Program Kerja
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{totalPrograms}</div>
            <div className="mt-1 text-xs text-gray-500">Terdaftar di seluruh unit yayasan</div>
          </Card>
          <Card className="border-blue-100 bg-white">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Sedang Berjalan
            </div>
            <div className="mt-2 text-3xl font-bold text-blue-700">{ongoingPrograms}</div>
            <div className="mt-1 text-xs text-gray-500">Program dalam tahap eksekusi</div>
          </Card>
          <Card className="border-teal-100 bg-white">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Telah Tuntas
            </div>
            <div className="mt-2 text-3xl font-bold text-emerald-700">{completedPrograms}</div>
            <div className="mt-1 text-xs text-gray-500">Laporan realisasi selesai</div>
          </Card>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Daftar Program Kerja</h2>
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
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 font-medium">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Nama Program</th>
                      <th scope="col" className="px-6 py-3.5">Bidang / Departemen</th>
                      <th scope="col" className="px-6 py-3.5">Prioritas</th>
                      <th scope="col" className="px-6 py-3.5">Status</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Indikator KPI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {programs.map((prog) => (
                      <tr key={prog.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{prog.title}</div>
                          {prog.description && (
                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {prog.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {prog.department?.name || "Yayasan Alfida"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-gray-700 capitalize">
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
                          <span className="text-xs text-gray-600 font-medium">
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
    </div>
  );
}
