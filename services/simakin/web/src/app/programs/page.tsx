"use client";

import React, { useState, useEffect } from "react";
import { SimakinShell } from "@/components/simakin-shell";
import { ProgramUploadModal } from "@/components/program-upload-modal";
import { ConfirmModal } from "@/components/confirm-modal";
import {
  getPrograms,
  getDepartments,
  createProgram,
  updateProgram,
  deleteProgram,
} from "@/actions/strategic";
import { Badge, EmptyState, LoadingState, ErrorState } from "@alfida/ui";

interface Department {
  id: string;
  name: string;
}

interface ProgramItem {
  id: string;
  departmentId: string;
  title: string;
  description: string | null;
  status: "planned" | "ongoing" | "completed";
  priority: "critical" | "high" | "medium" | "low";
  department?: Department;
  kpis?: any[];
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [search, setSearch] = useState("");

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<ProgramItem | null>(null);
  const [formData, setFormData] = useState({
    departmentId: "",
    title: "",
    description: "",
    priority: "medium" as "critical" | "high" | "medium" | "low",
    status: "planned" as "planned" | "ongoing" | "completed",
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [progData, deptData] = await Promise.all([
        getPrograms(selectedDept || undefined),
        getDepartments().catch(() => []),
      ]);
      setPrograms(Array.isArray(progData) ? progData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat daftar program kerja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) setCurrentUser(d.user);
      })
      .catch(() => {});
    fetchData();
  }, [selectedDept]);

  const isSuperAdmin = currentUser?.roles?.some((r: any) => r.role === "super_admin");
  const isAdminBidang = currentUser?.roles?.some((r: any) => r.role === "admin_bidang") || isSuperAdmin;
  const isAdminBiro = currentUser?.roles?.some((r: any) => r.role === "admin_biro");
  const canCreateOrEdit = isAdminBidang || isAdminBiro;
  const canDelete = isAdminBidang;

  const handleOpenAdd = () => {
    setEditingProg(null);
    setFormData({
      departmentId: departments[0]?.id || "",
      title: "",
      description: "",
      priority: "medium",
      status: "planned",
    });
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (departments.length > 0 && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "true") {
        handleOpenAdd();
      }
    }
  }, [departments]);

  const handleOpenEdit = (prog: ProgramItem) => {
    setEditingProg(prog);
    setFormData({
      departmentId: prog.departmentId,
      title: prog.title,
      description: prog.description || "",
      priority: prog.priority || "medium",
      status: prog.status || "planned",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.departmentId) return;

    setSubmitting(true);
    try {
      if (editingProg) {
        await updateProgram(editingProg.id, formData);
      } else {
        await createProgram(formData);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Error: " + (err.message || "Gagal menyimpan program kerja"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      await deleteProgram(deletingId);
      setDeletingId(null);
      fetchData();
    } catch (err: any) {
      alert("Error: " + (err.message || "Gagal menghapus program kerja"));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !selectedStatus || p.status === selectedStatus;
    const matchesPriority = !selectedPriority || p.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <SimakinShell activePath="/programs">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-primary">
              Manajemen Program Kerja Strategis
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Rencana kerja tahunan (RKT) dan rencana strategis jangka menengah (RKJM) unit kerja Yayasan Alfida
            </p>
          </div>
          {canCreateOrEdit && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="px-3.5 py-2 bg-white border border-border hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-rounded text-tertiary text-[18px]">upload_file</span>
                <span>Unggah Spreadsheet Excel</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3.5 py-2 bg-tertiary hover:bg-[#0b6355] text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-rounded text-[18px]">add</span>
                <span>+ Tambah Program</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Cari program kerja..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white text-primary"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 border border-border rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-primary"
          >
            <option value="">Semua Bidang / Biro</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-primary"
          >
            <option value="">Semua Status</option>
            <option value="planned">Direncanakan</option>
            <option value="ongoing">Sedang Berjalan</option>
            <option value="completed">Selesai</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-border rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-primary"
          >
            <option value="">Semua Prioritas</option>
            <option value="critical">Kritis (Critical)</option>
            <option value="high">Tinggi (High)</option>
            <option value="medium">Menengah (Medium)</option>
            <option value="low">Rendah (Low)</option>
          </select>
        </div>

        {/* Content Table */}
        <div className="mt-6">
          {loading ? (
            <LoadingState message="Memuat program kerja..." />
          ) : error ? (
            <ErrorState
              title="Gagal Memuat Program"
              message={error}
              onRetry={fetchData}
            />
          ) : filteredPrograms.length === 0 ? (
            <EmptyState
              title="Tidak Ditemukan Program Kerja"
              description="Belum ada program kerja yang cocok dengan filter yang dipilih."
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
                      <th scope="col" className="px-6 py-3.5">Indikator KPI</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPrograms.map((prog) => (
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
                          {prog.department?.name || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                              prog.priority === "critical"
                                ? "bg-red-100 text-red-800"
                                : prog.priority === "high"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
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
                        <td className="px-6 py-4">
                          <span className="text-[11px] text-tertiary font-semibold bg-[#e6f4f1] px-2 py-0.5 rounded-full">
                            {prog.kpis?.length || 0} KPI
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {canCreateOrEdit && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(prog)}
                                className="px-2.5 py-1 text-xs font-semibold text-tertiary hover:bg-[#e6f4f1] rounded border border-emerald-200 transition-colors"
                              >
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingId(prog.id);
                                  setDeletingTitle(prog.title);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Form Tambah / Edit */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-border">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <h3 className="text-base font-bold font-heading text-primary">
                  {editingProg ? "Edit Program Kerja" : "Tambah Program Kerja Baru"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-rounded text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Bidang / Biro Penanggung Jawab *
                  </label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white text-primary"
                  >
                    <option value="">Pilih Bidang / Biro</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Nama Program Kerja *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Optimalisasi Kurikulum & Literasi Santri"
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Tingkat Prioritas
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white text-primary"
                    >
                      <option value="critical">Kritis (Critical)</option>
                      <option value="high">Tinggi (High)</option>
                      <option value="medium">Menengah (Medium)</option>
                      <option value="low">Rendah (Low)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Status Pelaksanaan
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white text-primary"
                    >
                      <option value="planned">Direncanakan</option>
                      <option value="ongoing">Sedang Berjalan</option>
                      <option value="completed">Selesai</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Deskripsi & Sasaran Program
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tuliskan tujuan, sasaran target, dan hasil yang diharapkan..."
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded border border-border"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-tertiary hover:bg-[#0b6355] rounded shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : "Simpan Program"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Impor Excel */}
        <ProgramUploadModal
          isOpen={isUploadOpen}
          departments={departments}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={fetchData}
        />

        {/* Modal Konfirmasi Hapus */}
        <ConfirmModal
          isOpen={!!deletingId}
          title="Konfirmasi Hapus Program"
          message={`Yakin ingin menghapus program "${deletingTitle}"? Seluruh target KPI dan riwayat log terkait program ini akan dihapus.`}
          confirmLabel="Hapus Program"
          loading={submitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingId(null)}
        />
      </div>
    </SimakinShell>
  );
}
