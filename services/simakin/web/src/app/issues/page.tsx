"use client";

import React, { useState, useEffect } from "react";
import { SimakinShell } from "@/components/simakin-shell";
import { ConfirmModal } from "@/components/confirm-modal";
import {
  getIssues,
  createIssue,
  updateIssue,
  deleteIssue,
} from "@/actions/strategic";
import { Badge, EmptyState, LoadingState, ErrorState } from "@alfida/ui";

interface IssueItem {
  id: string;
  departmentId?: string | null;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "resolved" | "in_progress";
  resolution?: string | null;
  createdAt: string;
  reporter?: { fullName: string };
  department?: { name: string };
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    title: "",
    description: "",
    severity: "medium" as "critical" | "high" | "medium" | "low",
  });

  // Modal Resolve
  const [resolvingIssue, setResolvingIssue] = useState<IssueItem | null>(null);
  const [resolutionText, setResolutionText] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIssues();
      setIssues(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat daftar kendala");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.title.trim()) return;

    setSubmitting(true);
    try {
      await createIssue(issueForm);
      setIsModalOpen(false);
      setIssueForm({ title: "", description: "", severity: "medium" });
      fetchData();
    } catch (err: any) {
      alert("Error: " + (err.message || "Gagal mencatat kendala"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIssue || !resolutionText.trim()) return;

    setSubmitting(true);
    try {
      await updateIssue(resolvingIssue.id, {
        status: "resolved",
        resolution: resolutionText.trim(),
      });
      setResolvingIssue(null);
      setResolutionText("");
      fetchData();
    } catch (err: any) {
      alert("Error: " + (err.message || "Gagal menyelesaikan kendala"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      await deleteIssue(deletingId);
      setDeletingId(null);
      fetchData();
    } catch (err: any) {
      alert("Gagal menghapus kendala: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SimakinShell activePath="/issues">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-primary">
              Pelaporan Kendala & Eskalasi Masalah (Issues)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Pencatatan hambatan operasional, mitigasi resiko capaian target, dan solusi tindak lanjut pimpinan
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-rounded text-[18px]">report_problem</span>
            <span>+ Laporkan Kendala</span>
          </button>
        </div>

        {/* Content Table */}
        <div className="mt-6">
          {loading ? (
            <LoadingState message="Memuat daftar kendala..." />
          ) : error ? (
            <ErrorState
              title="Gagal Memuat Kendala"
              message={error}
              onRetry={fetchData}
            />
          ) : issues.length === 0 ? (
            <EmptyState
              title="Tidak Ada Kendala Aktif"
              description="Seluruh program dan kegiatan berjalan lancar tanpa hambatan kritis yang dilaporkan."
            />
          ) : (
            <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-xs text-left">
                  <thead className="bg-[#F7F8F8] text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th scope="col" className="px-5 py-3.5">Judul Kendala</th>
                      <th scope="col" className="px-5 py-3.5">Tingkat Keparahan</th>
                      <th scope="col" className="px-5 py-3.5">Status</th>
                      <th scope="col" className="px-5 py-3.5">Solusi / Mitigasi</th>
                      <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {issues.map((iss) => (
                      <tr key={iss.id} className="hover:bg-[#fafbfb] transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-primary">{iss.title}</div>
                          <div className="text-[11px] text-gray-500 mt-1 whitespace-pre-wrap">
                            {iss.description}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1">
                            Dilaporkan: {new Date(iss.createdAt).toLocaleDateString("id-ID")}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              iss.severity === "critical"
                                ? "bg-red-100 text-red-800"
                                : iss.severity === "high"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {iss.severity}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={iss.status === "resolved" ? "success" : "danger"}>
                            {iss.status === "resolved" ? "Selesai / Teratasi" : "Belum Terselesaikan"}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          {iss.resolution ? (
                            <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-100 whitespace-pre-wrap">
                              {iss.resolution}
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Belum ada catatan solusi.</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {iss.status !== "resolved" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setResolvingIssue(iss);
                                  setResolutionText("");
                                }}
                                className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                              >
                                Selesaikan
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDeletingId(iss.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded border border-red-200"
                            >
                              Hapus
                            </button>
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

        {/* Modal Laporkan Kendala */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-border">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <h3 className="text-base font-bold font-heading text-primary">
                  Laporkan Kendala / Masalah Operasional
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-rounded text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateIssue} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Pokok Masalah / Hambatan *
                  </label>
                  <input
                    type="text"
                    required
                    value={issueForm.title}
                    onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                    placeholder="Contoh: Keterlambatan Pengiriman Modul Pembelajaran"
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Tingkat Keparahan (Severity)
                  </label>
                  <select
                    value={issueForm.severity}
                    onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white text-primary"
                  >
                    <option value="critical">Kritis (Menghentikan Operasional)</option>
                    <option value="high">Tinggi (Berdampak pada Target KPI)</option>
                    <option value="medium">Menengah (Dapat Dimonitor)</option>
                    <option value="low">Rendah (Hambatan Minor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Uraian Detail Masalah & Akar Penyebab
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={issueForm.description}
                    onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                    placeholder="Jelaskan dampak masalah, faktor pemicu, dan kendala yang dihadapi di lapangan..."
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
                    className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Mengirim..." : "Laporkan Masalah"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Selesaikan Kendala */}
        {resolvingIssue && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-border">
              <h3 className="text-base font-bold font-heading text-primary mb-1">
                Selesaikan Kendala
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Catat tindakan perbaikan dan resolusi untuk <strong>{resolvingIssue.title}</strong>.
              </p>

              <form onSubmit={handleResolveSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Uraian Solusi & Tindakan yang Dilakukan *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Tuliskan solusi yang telah dieksekusi untuk mengatasi masalah ini..."
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setResolvingIssue(null)}
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded border border-border"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Memproses..." : "Tandai Selesai"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Hapus */}
        <ConfirmModal
          isOpen={!!deletingId}
          title="Konfirmasi Hapus Kendala"
          message="Yakin ingin menghapus catatan kendala ini dari sistem?"
          confirmLabel="Hapus Kendala"
          loading={submitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingId(null)}
        />
      </div>
    </SimakinShell>
  );
}
