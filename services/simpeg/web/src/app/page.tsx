"use client";

import React, { useState, useEffect } from "react";
import { AppShell, Card, Badge, Button, EmptyState, LoadingState, ErrorState } from "@alfida/ui";
import { UnitManagementPanel } from "../components/organization/unit-management-panel";
import { UnitAdminModal } from "../components/organization/unit-admin-modal";
import { DepartmentManagementPanel } from "../components/organization/department-management-panel";
import { DepartmentAdminModal } from "../components/organization/department-admin-modal";
import { OrganizationDepartment, OrganizationEmployee, OrganizationUnit } from "../components/organization/types";

interface Assignment {
  id: string;
  userId: string;
  unitId: string;
  unitName: string;
  role: string;
  isPrimary: boolean;
  startDate: string;
  endDate?: string | null;
  skNumber?: string | null;
  user?: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

interface LeaveRequest {
  id: string;
  userId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
  user?: {
    fullName: string;
    leaveQuota: number;
  };
}

type SimpegTab = "assignments" | "attendance" | "leaves" | "liqo" | "units" | "departments" | "gps-settings";

export default function SimpegDashboard() {
  const [activeTab, setActiveTab] = useState<SimpegTab>("assignments");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<OrganizationEmployee[]>([]);
  const [attendanceContext, setAttendanceContext] = useState<any>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [units, setUnits] = useState<OrganizationUnit[]>([]);
  const [departments, setDepartments] = useState<OrganizationDepartment[]>([]);
  const [gpsConfigs, setGpsConfigs] = useState<any[]>([]);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showGpsConfigModal, setShowGpsConfigModal] = useState(false);
  const [gpsConfigForm, setGpsConfigForm] = useState({ unitId: "", latitude: "", longitude: "", radiusMeters: "50" });
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [managedUnit, setManagedUnit] = useState<OrganizationUnit | null>(null);
  const [managedDepartment, setManagedDepartment] = useState<OrganizationDepartment | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    userId: "",
    unitName: "",
    unitId: "",
    role: "Guru Kelas",
    isPrimary: true,
    startDate: new Date().toISOString().slice(0, 10),
    skNumber: "SK/001/YAF/2026",
  });

  const [leaveForm, setLeaveForm] = useState({
    type: "cuti",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    reason: "",
  });

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ fullName: string; role: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resAssignments, resLeaves, resEmployees, resUnits, resDepartments, resAttendanceContext, resGpsConfigs] = await Promise.all([
        fetch("/api/assignments").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/leaves").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/employees").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/units").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/departments").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/attendance/context").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/attendance/configs").then((r) => (r.ok ? r.json() : [])),
      ]);

      setAssignments(resAssignments || []);
      setLeaves(resLeaves || []);
      setEmployees(resEmployees || []);
      setUnits(resUnits || []);
      setDepartments(resDepartments || []);
      setAttendanceContext(resAttendanceContext);
      setGpsConfigs(resGpsConfigs || []);
      if (resEmployees && resEmployees.length > 0 && !newAssignment.userId) {
        setNewAssignment((prev) => ({ ...prev, userId: resEmployees[0].id }));
      }
      if (resUnits && resUnits.length > 0) {
        setNewAssignment((prev) => !prev.unitId
          ? { ...prev, unitId: resUnits[0].id, unitName: resUnits[0].name }
          : prev);
      }
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data kepegawaian.");
    } finally {
      setLoading(false);

    }
  };

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("https://auth.alfida.or.id/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const primaryRole = data.user.roles?.[0]?.role
              ? data.user.roles[0].role.replace(/_/g, " ").toUpperCase()
              : "PEGAWAI";
            setCurrentUser({
              fullName: data.user.fullName,
              role: primaryRole,
            });
            return;
          }
        }
      } catch (e) {}
    }
    loadUser();
    fetchData();
  }, []);

  const handleSaveGpsConfig = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!gpsConfigForm.unitId || !gpsConfigForm.latitude || !gpsConfigForm.longitude) return;
    setIsSubmitting(true);
    setGpsError(null);
    try {
      const response = await fetch("/api/attendance/configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: gpsConfigForm.unitId,
          latitude: Number(gpsConfigForm.latitude),
          longitude: Number(gpsConfigForm.longitude),
          radiusMeters: Number(gpsConfigForm.radiusMeters || 50),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Konfigurasi GPS gagal disimpan.");
      setActionSuccess("Konfigurasi GPS unit berhasil disimpan.");
      setShowGpsConfigModal(false);
      setGpsConfigForm({ unitId: "", latitude: "", longitude: "", radiusMeters: "50" });
      fetchData();
    } catch (err: any) {
      setGpsError(err.message || "Konfigurasi GPS gagal disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.userId || !newAssignment.unitId || !newAssignment.unitName) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAssignment),
      });

      if (!res.ok) throw new Error("Gagal menyimpan penugasan unit.");

      setShowAddAssignmentModal(false);
      setActionSuccess("Penugasan unit pegawai berhasil ditambahkan.");
      setTimeout(() => setActionSuccess(null), 4000);
      fetchData();
    } catch (err: any) {
      setFeedbackError(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCoordinates = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("Perangkat atau browser Anda tidak mendukung GPS Geolocation."));
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          let msg = "Gagal mengambil lokasi GPS.";
          if (err.code === err.PERMISSION_DENIED) {
            msg = "Izin akses lokasi ditolak oleh browser. Mohon aktifkan izin GPS untuk presensi.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            msg = "Informasi lokasi tidak tersedia saat ini.";
          } else if (err.code === err.TIMEOUT) {
            msg = "Waktu pencarian sinyal GPS habis. Coba lagi di tempat terbuka.";
          }
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const handleCheckInGps = async () => {
    setIsSubmitting(true);
    try {
      const coords = await getCoordinates();
      const res = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coords),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal melakukan presensi GPS.");
      }

      setActionSuccess("Presensi masuk berhasil dicatat.");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setFeedbackError(err.message || "Terjadi kesalahan saat menjalankan tindakan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOutGps = async () => {
    setIsSubmitting(true);
    try {
      const coords = await getCoordinates();
      const res = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coords),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal melakukan presensi pulang.");
      }

      setActionSuccess("Presensi keluar berhasil dicatat.");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setFeedbackError(err.message || "Terjadi kesalahan saat menjalankan tindakan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveLeave = async (id: string) => {
    try {
      const res = await fetch(`/api/leaves/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Gagal menyetujui pengajuan.");
      setActionSuccess("Pengajuan cuti/izin telah disetujui.");
      setTimeout(() => setActionSuccess(null), 4000);
      fetchData();
    } catch (err: any) {
      setFeedbackError(err.message || "Terjadi kesalahan saat menjalankan tindakan.");
    }
  };

  const handleRejectLeave = async (id: string) => {
    try {
      const res = await fetch(`/api/leaves/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Gagal menolak pengajuan.");
      setActionSuccess("Pengajuan cuti/izin telah ditolak.");
      setTimeout(() => setActionSuccess(null), 4000);
      fetchData();
    } catch (err: any) {
      setFeedbackError(err.message || "Terjadi kesalahan saat menjalankan tindakan.");
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.reason) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leaves/my", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengajukan cuti.");

      setLeaveForm({
        type: "cuti",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        reason: "",
      });
      setActionSuccess("Pengajuan cuti/izin berhasil diajukan.");
      setTimeout(() => setActionSuccess(null), 4000);
      fetchData();
    } catch (err: any) {
      setFeedbackError(err.message || "Terjadi kesalahan saat menjalankan tindakan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sidebarGroups = [
    {
      title: "Kepegawaian",
      items: [
        {
          label: "Penugasan Unit",
          href: "#assignments",
          icon: "badge",
          active: activeTab === "assignments",
          onClick: () => setActiveTab("assignments"),
        },
        {
          label: "Presensi GPS",
          href: "#attendance",
          icon: "location_on",
          active: activeTab === "attendance",
          onClick: () => setActiveTab("attendance"),
        },
      ],
    },
    {
      title: "Master Kepegawaian",
      items: [
        {
          label: "Unit & Lokasi Kerja",
          href: "#units",
          icon: "domain",
          active: activeTab === "units",
          onClick: () => setActiveTab("units"),
        },
        {
          label: "Bidang & Departemen",
          href: "#departments",
          icon: "account_tree",
          active: activeTab === "departments",
          onClick: () => setActiveTab("departments"),
        },
        {
          label: "Konfigurasi GPS",
          href: "#gps-settings",
          icon: "my_location",
          active: activeTab === "gps-settings",
          onClick: () => setActiveTab("gps-settings"),
        },
      ],
    },
    {
      title: "Layanan Mandiri",
      items: [
        {
          label: "Cuti & Perizinan",
          href: "#leaves",
          icon: "event_busy",
          active: activeTab === "leaves",
          onClick: () => setActiveTab("leaves"),
        },
        {
          label: "Bina Pribadi (Liqo)",
          href: "#liqo",
          icon: "diversity_3",
          active: activeTab === "liqo",
          onClick: () => setActiveTab("liqo"),
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
        },
      ],
    },
  ];

  return (
    <AppShell
      serviceName="SIMPEG"
      userName={currentUser?.fullName || "Memuat..."}
      userRole={currentUser?.role || ""}
      sidebarGroups={sidebarGroups}
      onLogout={() => {
        window.location.href = "https://auth.alfida.or.id/login";
      }}
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sistem Manajemen Kepegawaian (SIMPEG)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Pengelolaan penugasan unit kerja, presensi GPS, permohonan cuti, dan pembinaan pegawai Yayasan Alfida.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              Segarkan Data
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddAssignmentModal(true)}
            >
              Tambah Penugasan Unit
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-emerald-600 hover:text-emerald-900 font-semibold"
            >
              Tutup
            </button>
          </div>
        )}

        {feedbackError && (
          <div className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
            <span>{feedbackError}</span>
            <button type="button" onClick={() => setFeedbackError(null)} className="font-semibold text-rose-700 hover:text-rose-900">Tutup</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "assignments"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Penugasan Unit ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "attendance"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Presensi GPS
          </button>
          <button
            onClick={() => setActiveTab("leaves")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "leaves"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Cuti & Izin ({leaves.length})
          </button>
          <button
            onClick={() => setActiveTab("liqo")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "liqo"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Pembinaan & BPI
          </button>
        </div>

        {/* Content Section */}
        {loading ? (
          <LoadingState message="Memuat data kepegawaian..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : (
          <div>
            {/* TAB 1: PENUGASAN UNIT PEGAWAI */}
            {activeTab === "assignments" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Card className="p-4 bg-white border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase font-medium">Total Penugasan</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{assignments.length}</p>
                  </Card>
                  <Card className="p-4 bg-white border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase font-medium">Penugasan Utama</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {assignments.filter((a) => a.isPrimary).length}
                    </p>
                  </Card>
                  <Card className="p-4 bg-white border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase font-medium">Penugasan Tambahan</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {assignments.filter((a) => !a.isPrimary).length}
                    </p>
                  </Card>
                </div>

                {assignments.length === 0 ? (
                  <EmptyState
                    title="Belum ada penugasan unit"
                    description="Belum ada catatan penugasan pegawai ke unit kerja atau sekolah."
                    actionLabel="Tambah Penugasan Pertama"
                    onAction={() => setShowAddAssignmentModal(true)}
                  />
                ) : (
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3">Nama Pegawai</th>
                            <th className="px-6 py-3">Unit Kerja</th>
                            <th className="px-6 py-3">Peran / Posisi</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">No. SK</th>
                            <th className="px-6 py-3">Periode</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {assignments.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900">
                                {item.user?.fullName || "Pegawai Terdaftar"}
                                <div className="text-xs text-slate-400 font-normal">
                                  {item.user?.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-800">
                                {item.unitName}
                              </td>
                              <td className="px-6 py-4 text-slate-600">
                                {item.role}
                              </td>
                              <td className="px-6 py-4">
                                {item.isPrimary ? (
                                  <Badge variant="success">Utama</Badge>
                                ) : (
                                  <Badge variant="neutral">Tambahan</Badge>
                                )}
                              </td>
                              <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                                {item.skNumber || "Belum ada SK"}
                              </td>
                              <td className="px-6 py-4 text-slate-500 text-xs">
                                {new Date(item.startDate).toLocaleDateString("id-ID")}
                                {item.endDate
                                  ? ` s/d ${new Date(item.endDate).toLocaleDateString("id-ID")}`
                                  : " s/d Sekarang"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PRESENSI GPS */}
            {activeTab === "attendance" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white border border-slate-200 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Aktivasi Presensi Mandiri Pegawai
                  </h3>
                  <p className="text-sm text-slate-600">
                    Presensi GPS mencatat koordinat lokasi terkini perangkat Anda dan memvalidasi jarak terhadap lokasi unit kerja terdaftar.
                  </p>

                  {attendanceContext?.config ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm space-y-2">
                      <div className="flex justify-between"><span className="text-slate-500">Unit Utama:</span><span className="font-medium text-slate-900">{attendanceContext.unitName}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Lokasi GPS:</span><span className="font-medium text-slate-900">{Number(attendanceContext.config.latitude).toFixed(5)}, {Number(attendanceContext.config.longitude).toFixed(5)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Maksimum Radius:</span><span className="font-medium text-slate-900">{attendanceContext.config.radiusMeters} Meter</span></div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">Penugasan atau konfigurasi GPS unit Anda belum tersedia. Hubungi admin kepegawaian.</div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="primary"
                      onClick={handleCheckInGps}
                      disabled={isSubmitting || !attendanceContext?.config}
                      className="flex-1"
                    >
                      Check-In Masuk (GPS)
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleCheckOutGps}
                      disabled={isSubmitting || !attendanceContext?.config}
                      className="flex-1"
                    >
                      Check-Out Pulang (GPS)
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 bg-white border border-slate-200 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Status Presensi Hari Ini
                  </h3>
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-900">
                    Presensi hari ini aktif dan terhubung dengan server sinkronisasi SIMPEG.
                  </div>
                  <p className="text-xs text-slate-500">
                    Catatan kehadiran akan diselaraskan dengan perhitungan jam mengajar guru dan evaluasi bulanan karyawan.
                  </p>
                </Card>
              </div>
            )}

            {/* TAB 3: CUTI & IZIN */}
            {activeTab === "leaves" && (
              <div className="space-y-6">
                {/* Form Pengajuan Cuti */}
                <Card className="p-6 bg-white border border-slate-200 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Ajukan Permohonan Cuti atau Izin
                  </h3>
                  <form onSubmit={handleLeaveSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Jenis Permohonan
                      </label>
                      <select
                        value={leaveForm.type}
                        onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                        className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
                      >
                        <option value="cuti">Cuti Tahunan</option>
                        <option value="sakit">Sakit</option>
                        <option value="izin">Izin Keperluan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                        className="w-full text-sm border border-slate-300 rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Tanggal Selesai
                      </label>
                      <input
                        type="date"
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                        className="w-full text-sm border border-slate-300 rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Alasan Permohonan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Keperluan keluarga mendesak"
                        value={leaveForm.reason}
                        onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                        className="w-full text-sm border border-slate-300 rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        Kirim Permohonan
                      </Button>
                    </div>
                  </form>
                </Card>

                {/* Daftar Riwayat Cuti */}
                <div className="space-y-3">
                  <h3 className="text-md font-semibold text-slate-900">
                    Daftar Pengajuan Masuk
                  </h3>

                  {leaves.length === 0 ? (
                    <EmptyState
                      title="Belum ada riwayat permohonan"
                      description="Belum ada data pengajuan cuti atau izin yang tercatat dalam sistem."
                    />
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3">Nama Pegawai</th>
                            <th className="px-6 py-3">Jenis</th>
                            <th className="px-6 py-3">Rentang Tanggal</th>
                            <th className="px-6 py-3">Alasan</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {leaves.map((leave) => (
                            <tr key={leave.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900">
                                {leave.user?.fullName || "Pegawai"}
                              </td>
                              <td className="px-6 py-4 uppercase text-xs font-semibold">
                                {leave.type}
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-600">
                                {new Date(leave.startDate).toLocaleDateString("id-ID")} -{" "}
                                {new Date(leave.endDate).toLocaleDateString("id-ID")}
                              </td>
                              <td className="px-6 py-4 text-slate-600 text-xs">
                                {leave.reason}
                              </td>
                              <td className="px-6 py-4">
                                {leave.status === "approved" ? (
                                  <Badge variant="success">Disetujui</Badge>
                                ) : leave.status === "rejected" ? (
                                  <Badge variant="danger">Ditolak</Badge>
                                ) : (
                                  <Badge variant="warning">Menunggu</Badge>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                {leave.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={() => handleApproveLeave(leave.id)}
                                    >
                                      Setujui
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={() => handleRejectLeave(leave.id)}
                                    >
                                      Tolak
                                    </Button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: UNIT & LOKASI KERJA */}
            {activeTab === "units" && (
              <UnitManagementPanel units={units} onRefresh={fetchData} onManageAdmins={setManagedUnit} />
            )}

            {/* TAB 5: BIDANG & DEPARTEMEN */}
            {activeTab === "departments" && (
              <DepartmentManagementPanel departments={departments} onRefresh={fetchData} onManageAdmins={setManagedDepartment} />
            )}

            {/* TAB 6: KONFIGURASI GPS */}
            {activeTab === "gps-settings" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"><div><h2 className="font-heading text-xl font-bold text-primary">Konfigurasi Lokasi GPS</h2><p className="text-sm text-slate-500 mt-1">Tentukan titik koordinat dan radius presensi untuk setiap unit kerja.</p></div><Button variant="primary" size="sm" onClick={() => { setGpsError(null); setShowGpsConfigModal(true); }}>Atur Lokasi GPS</Button></div>
                {gpsConfigs.length === 0 ? <EmptyState title="Belum ada lokasi GPS" description="Atur koordinat unit agar pegawai dapat melakukan check-in dan check-out berbasis lokasi." actionLabel="Atur Lokasi GPS" onAction={() => setShowGpsConfigModal(true)} /> : (
                  <div className="overflow-x-auto border border-border rounded-lg bg-white"><table className="w-full text-left text-sm"><thead className="bg-[#F7F8F8] text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Unit</th><th className="px-5 py-3">Latitude</th><th className="px-5 py-3">Longitude</th><th className="px-5 py-3">Radius</th></tr></thead><tbody className="divide-y divide-border">{gpsConfigs.map((config) => { const unit = config.unit || units.find((item) => item.id === config.unitId); return <tr key={config.id}><td className="px-5 py-4 font-semibold text-primary">{unit?.name || config.unitId}</td><td className="px-5 py-4 font-mono text-xs">{config.latitude}</td><td className="px-5 py-4 font-mono text-xs">{config.longitude}</td><td className="px-5 py-4">{config.radiusMeters} meter</td></tr>; })}</tbody></table></div>
                )}
              </div>
            )}

            {/* TAB 7: PEMBINAAN & BPI */}
            {activeTab === "liqo" && (
              <div className="space-y-4">
                <Card className="p-6 bg-white border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Pembinaan Islam Pegawai (BPI / UPA)
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Monitoring keikutsertaan halaqah liqo pekanan dan pembinaan karakter Islami tenaga pengajar serta karyawan yayasan.
                  </p>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                    Modul halaqah terhubung langsung dengan sistem pelaporan presensi liqo murobbi dan catatan mutabaah harian.
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Modal Konfigurasi GPS */}
        {showGpsConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="gps-config-title">
            <div className="w-full max-w-md rounded-md border border-border bg-surface p-5">
              <div className="flex items-start justify-between border-b border-border pb-3"><div><h3 id="gps-config-title" className="font-heading font-bold text-primary">Konfigurasi Lokasi GPS</h3><p className="mt-1 text-xs text-slate-500">Gunakan koordinat titik pusat unit kerja.</p></div><button type="button" onClick={() => setShowGpsConfigModal(false)} className="text-slate-500" aria-label="Tutup konfigurasi GPS"><span className="material-symbols-rounded" aria-hidden="true">close</span></button></div>
              {gpsError && <p className="mt-4 rounded-sm border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">Pesan kesalahan dari server akan ditampilkan di sini: {gpsError}</p>}
              <form onSubmit={handleSaveGpsConfig} className="mt-4 space-y-4"><label className="block text-xs font-semibold text-primary">Unit Kerja<select required value={gpsConfigForm.unitId} onChange={(event) => setGpsConfigForm({ ...gpsConfigForm, unitId: event.target.value })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Pilih unit</option>{units.filter((unit) => unit.isActive).map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-semibold text-primary">Latitude<input required type="number" min="-90" max="90" step="any" value={gpsConfigForm.latitude} onChange={(event) => setGpsConfigForm({ ...gpsConfigForm, latitude: event.target.value })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" placeholder="-6.200000" /></label><label className="block text-xs font-semibold text-primary">Longitude<input required type="number" min="-180" max="180" step="any" value={gpsConfigForm.longitude} onChange={(event) => setGpsConfigForm({ ...gpsConfigForm, longitude: event.target.value })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" placeholder="106.816666" /></label></div><label className="block text-xs font-semibold text-primary">Radius (meter)<input required type="number" min="10" max="1000" value={gpsConfigForm.radiusMeters} onChange={(event) => setGpsConfigForm({ ...gpsConfigForm, radiusMeters: event.target.value })} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" /></label><div className="flex justify-end gap-2 border-t border-border pt-3"><Button type="button" variant="secondary" size="sm" onClick={() => setShowGpsConfigModal(false)}>Batal</Button><Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan Lokasi"}</Button></div></form>
            </div>
          </div>
        )}

        <UnitAdminModal unit={managedUnit} employees={employees} onClose={() => setManagedUnit(null)} onChanged={fetchData} />
        <DepartmentAdminModal department={managedDepartment} employees={employees} onClose={() => setManagedDepartment(null)} onChanged={fetchData} />

        {/* Modal Tambah Penugasan */}
        {showAddAssignmentModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-semibold text-slate-900">
                  Tambah Penugasan Unit Baru
                </h3>
                <button
                  onClick={() => setShowAddAssignmentModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Pilih Pegawai
                  </label>
                  <select
                    value={newAssignment.userId}
                    onChange={(e) =>
                      setNewAssignment({ ...newAssignment, userId: e.target.value })
                    }
                    className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
                    required
                  >
                    <option value="">Pilih Pegawai...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Pilih Unit Kerja
                  </label>
                  <select
                    value={newAssignment.unitId}
                    onChange={(e) => {
                      const selectedOpt = e.target.options[e.target.selectedIndex];
                      setNewAssignment({
                        ...newAssignment,
                        unitId: e.target.value,
                        unitName: selectedOpt.text,
                      });
                    }}
                    className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
                    required
                  >
                    {units.filter((unit) => unit.isActive).length === 0 ? (
                      <option value="">Buat unit kerja terlebih dahulu</option>
                    ) : (
                      units.filter((unit) => unit.isActive).map((unit) => (
                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Peran / Jabatan di Unit
                  </label>
                  <input
                    type="text"
                    value={newAssignment.role}
                    onChange={(e) =>
                      setNewAssignment({ ...newAssignment, role: e.target.value })
                    }
                    className="w-full text-sm border border-slate-300 rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nomor SK Penugasan
                  </label>
                  <input
                    type="text"
                    value={newAssignment.skNumber}
                    onChange={(e) =>
                      setNewAssignment({ ...newAssignment, skNumber: e.target.value })
                    }
                    className="w-full text-sm border border-slate-300 rounded px-3 py-2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={newAssignment.isPrimary}
                    onChange={(e) =>
                      setNewAssignment({ ...newAssignment, isPrimary: e.target.checked })
                    }
                  />
                  <label htmlFor="isPrimary" className="text-xs text-slate-700">
                    Jadikan sebagai unit penugasan utama
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddAssignmentModal(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    Simpan Penugasan
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
