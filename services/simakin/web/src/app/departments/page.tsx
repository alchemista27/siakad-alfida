"use client";

import React, { useState, useEffect } from "react";
import { SimakinShell } from "@/components/simakin-shell";
import { ConfirmModal } from "@/components/confirm-modal";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/actions/strategic";
import { EmptyState, LoadingState, ErrorState } from "@alfida/ui";

interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  leaderId: string | null;
  parentId: string | null;
  leader?: { id: string; fullName: string; email: string } | null;
  parent?: { id: string; name: string } | null;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    parentId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data struktur bidang/biro");
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
  }, []);

  const isSuperAdmin = currentUser?.roles?.some((r: any) => r.role === "super_admin");
  const isAdminBidang = currentUser?.roles?.some((r: any) => r.role === "admin_bidang") || isSuperAdmin;
  const canManageDepartments = isAdminBidang;

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ name: "", code: "", description: "", parentId: "" });
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "true") {
        handleOpenAdd();
      }
    }
  }, []);

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code || "",
      description: dept.description || "",
      parentId: dept.parentId || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        description: formData.description.trim() || undefined,
        parentId: formData.parentId || undefined,
      };

      if (editingDept) {
        await updateDepartment(editingDept.id, payload);
      } else {
        await createDepartment(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Error: " + (err.message || "Gagal menyimpan bidang"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      await deleteDepartment(deletingId);
      setDeletingId(null);
      fetchData();
    } catch (err: any) {
      alert("Error: " + (err.message || "Gagal menghapus bidang"));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.code && d.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SimakinShell activePath="/departments">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-primary">
              Struktur Organisasi Bidang & Biro
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Kelola hierarki struktur organisasi, biro pelaksana, dan penanggung jawab unit Yayasan Alfida
            </p>
          </div>
          {canManageDepartments && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-tertiary hover:bg-[#0b6355] text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span className="material-symbols-rounded text-[18px]">add</span>
              <span>+ Tambah Bidang / Biro</span>
            </button>
          )}
        </div>

        {/* Filter Search */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Cari nama bidang, biro, atau kode unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white text-primary"
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="mt-6">
          {loading ? (
            <LoadingState message="Memuat hierarki bidang dan biro..." />
          ) : error ? (
            <ErrorState
              title="Gagal Memuat Struktur"
              message={error}
              onRetry={fetchData}
            />
          ) : filteredDepts.length === 0 ? (
            <EmptyState
              title="Belum Ada Bidang Terdaftar"
              description="Belum ada bidang atau biro yang sesuai dengan pencarian Anda."
            />
          ) : (
            <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-xs text-left">
                  <thead className="bg-[#F7F8F8] text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Nama Bidang / Biro</th>
                      <th scope="col" className="px-6 py-3.5">Kode</th>
                      <th scope="col" className="px-6 py-3.5">Induk (Parent)</th>
                      <th scope="col" className="px-6 py-3.5">Deskripsi</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDepts.map((d) => (
                      <tr key={d.id} className="hover:bg-[#fafbfb] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-primary flex items-center gap-2">
                            <span className="material-symbols-rounded text-tertiary text-[18px]">
                              {d.parentId ? "subdirectory_arrow_right" : "domain"}
                            </span>
                            <span>{d.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                            {d.code || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {d.parent ? (
                            <span className="text-tertiary font-medium">{d.parent.name}</span>
                          ) : (
                            <span className="text-gray-400 italic">Pusat Yayasan</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                          {d.description || "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {canManageDepartments ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(d)}
                                className="px-2.5 py-1 text-xs font-semibold text-tertiary hover:bg-[#e6f4f1] rounded border border-emerald-200 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingId(d.id);
                                  setDeletingName(d.name);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
                              >
                                Hapus
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Lihat Saja</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Tambah / Edit Departemen */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-border">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <h3 className="text-base font-bold font-heading text-primary">
                  {editingDept ? "Edit Bidang / Biro" : "Tambah Bidang / Biro Baru"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-rounded text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Nama Bidang / Biro *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Bidang Pendidikan atau Biro SDM"
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Kode Singkatan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Contoh: DIK atau SDM"
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Induk Bidang (Parent Hierarchy)
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white text-primary"
                  >
                    <option value="">Pusat Yayasan (Tingkat Utama)</option>
                    {departments
                      .filter((dep) => !editingDept || dep.id !== editingDept.id)
                      .map((dep) => (
                        <option key={dep.id} value={dep.id}>
                          {dep.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Deskripsi Tugas & Fungsi
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Jelaskan ruang lingkup dan tanggung jawab unit ini..."
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
                    {submitting ? "Menyimpan..." : "Simpan Data"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Konfirmasi Hapus */}
        <ConfirmModal
          isOpen={!!deletingId}
          title="Konfirmasi Hapus Bidang"
          message={`Yakin ingin menghapus bidang "${deletingName}"? Seluruh program kerja di bawah bidang ini dapat terdampak.`}
          confirmLabel="Hapus Bidang"
          loading={submitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingId(null)}
        />
      </div>
    </SimakinShell>
  );
}
