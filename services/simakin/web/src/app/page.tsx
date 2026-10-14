"use client";

import React, { useState, useEffect } from "react";
import { AppShell, Badge, EmptyState, LoadingState, ErrorState } from "@alfida/ui";

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
            role: meData.user.roles?.[0]?.role ? meData.user.roles[0].role.replace(/_/g, " ").toUpperCase() : "PIMPINAN",
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

  const sidebarGroups = [
    {
      title: "Kinerja & Proker",
      items: [
        {
          label: "Dasbor & Matriks",
          href: "/",
          icon: "dashboard",
          active: true,
        },
        {
          label: "Program Kerja",
          href: "#programs",
          icon: "assignment",
          active: false,
        },
      ],
    },
    {
      title: "Rapat & Hambatan",
      items: [
        {
          label: "Notulensi & Aksi",
          href: "#meetings",
          icon: "groups",
          active: false,
        },
        {
          label: "Kendala & Masalah",
          href: "#issues",
          icon: "report_problem",
          active: false,
        },
        {
          label: "Bukti Dukung (Evidence)",
          href: "#evidence",
          icon: "verified",
          active: false,
        },
      ],
    },
    {
      title: "Sistem",
      items: [
        {
          label: "Portal Modul",
          href: "https://auth.alfida.or.id/modules",
          icon: "apps",
          active: false,
        },
      ],
    },
  ];

  return (
    <AppShell
      serviceName="SIMAKIN"
      userName={user?.fullName || "Pimpinan Yayasan"}
      userRole={user?.role || "ADMIN BIDANG"}
      onLogout={handleLogout}
      sidebarGroups={sidebarGroups}
      topbarActions={
        <a
          href="https://auth.alfida.or.id/modules"
          className="text-xs font-semibold text-tertiary hover:underline inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#e6f4f1]"
        >
          <span className="material-symbols-rounded text-[16px]">apps</span>
          <span className="hidden sm:inline">Pilih Modul</span>
        </a>
      }
    >
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
          <div className="flex items-center space-x-3">
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
          </div>
        </div>

        {/* Metric Cards (Sesuai Wireframe 04-admin-dashboard.html) */}
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
        <div className="mt-8" id="programs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold font-heading text-primary">
              Daftar Program Kerja & Indikator Capaian
            </h2>
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
    </AppShell>
  );
}
