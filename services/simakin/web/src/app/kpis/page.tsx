"use client";

import React, { useState, useEffect } from "react";
import { SimakinShell } from "@/components/simakin-shell";
import { KpiUploadModal } from "@/components/kpi-upload-modal";
import { ConfirmModal } from "@/components/confirm-modal";
import {
  getKPIs,
  getPrograms,
  createKPI,
  updateKPI,
  deleteKPI,
  submitKPIBaseline,
  verifyKPIBaseline,
  transitionWorkflow,
  type WorkflowStatus,
} from "@/actions/strategic";
import { WorkflowStatusBadge } from "@/components/strategic/workflow-status-badge";
import { Badge, EmptyState, LoadingState, ErrorState } from "@alfida/ui";

interface KPIItem {
  id: string;
  programId: string;
  name: string;
  code: string | null;
  indicatorType: string;
  direction: string;
  baseline: number;
  baselineStatus: string;
  baselineNotes?: string | null;
  target: number;
  realization: number;
  unit: string;
  weight: number;
  updateFrequency: string;
  program?: { id: string; title: string; departmentId?: string; department?: { id: string; name: string } };
  workflowStatus?: WorkflowStatus;
  submittedAt?: string | null;
  lastReviewedAt?: string | null;
}

interface ProgramOption {
  id: string;
  title: string;
  departmentId?: string;
}

export default function KpisPage() {
  const [kpis, setKpis] = useState<KPIItem[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [search, setSearch] = useState("");

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPIItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    programId: "",
    name: "",
    code: "",
    indicatorType: "output",
    direction: "higher_is_better",
    baseline: 0,
    target: 100,
    unit: "%",
    weight: 20,
    updateFrequency: "monthly",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [baselineKpi, setBaselineKpi] = useState<KPIItem | null>(null);
  const [baselineEvidenceId, setBaselineEvidenceId] = useState("");

  // Verification Modal State
  const [verifyingKpi, setVerifyingKpi] = useState<KPIItem | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"approved" | "revision_needed">("approved");
  const [verifyNotes, setVerifyNotes] = useState("");

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiData, progData] = await Promise.all([
        getKPIs(selectedProgram || undefined),
        getPrograms().catch(() => []),
      ]);
      setKpis(Array.isArray(kpiData) ? kpiData : []);
      setPrograms(Array.isArray(progData) ? progData : []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat indikator capaian KPI");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("https://auth.alfida.or.id/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) setCurrentUser(d.user);
      })
      .catch(() => {});
    fetchData();
  }, [selectedProgram]);

  const isSuperAdmin = currentUser?.roles?.some((r: any) => r.role === "super_admin");
  const isAdminBidang = currentUser?.roles?.some((r: any) => r.role === "admin_bidang") || isSuperAdmin;
  const isAdminBiro = currentUser?.roles?.some((r: any) => r.role === "admin_biro");
  const biroScopeIds = currentUser?.roles?.filter((r: any) => r.role === "admin_biro" && r.departmentId).map((r: any) => r.departmentId) || [];
  const manageableProgramIds = programs.filter((program) => biroScopeIds.includes(program.departmentId || "")).map((program) => program.id);
  const canVerifyBaseline = isAdminBidang;
  const canManageKpi = isAdminBiro && manageableProgramIds.length > 0;
  const canEditKpi = (kpi: KPIItem) => canManageKpi && manageableProgramIds.includes(kpi.programId) && ["draft", "revision_requested_by_biro", "revision_requested_by_bidang"].includes(kpi.workflowStatus || "draft");

  const handleOpenAdd = () => {
    setEditingKpi(null);
    setFormData({
      programId: programs.find((program) => manageableProgramIds.includes(program.id))?.id || "",
      name: "",
      code: "",
      indicatorType: "output",
      direction: "higher_is_better",
      baseline: 0,
      target: 100,
      unit: "%",
      weight: 20,
      updateFrequency: "monthly",
    });
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (programs.length > 0 && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "true") {
        handleOpenAdd();
      }
    }
  }, [programs]);

  const handleOpenEdit = (kpi: KPIItem) => {
    setEditingKpi(kpi);
    setFormData({
      programId: kpi.programId,
      name: kpi.name,
      code: kpi.code || "",
      indicatorType: kpi.indicatorType || "output",
      direction: kpi.direction || "higher_is_better",
      baseline: Number(kpi.baseline) || 0,
      target: Number(kpi.target) || 100,
      unit: kpi.unit || "%",
      weight: Number(kpi.weight) || 20,
      updateFrequency: kpi.updateFrequency || "monthly",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.programId) return;

    setSubmitting(true);
    try {
      const payload: any = {
        ...formData,
        baseline: Number(formData.baseline),
        target: Number(formData.target),
        weight: Number(formData.weight),
      };

      if (editingKpi) {
        await updateKPI(editingKpi.id, payload);
      } else {
        await createKPI(payload);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      setFeedback(err.message || "Gagal menyimpan KPI");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitBaseline = async () => {
    if (!baselineKpi) return;
    try {
      await submitKPIBaseline(baselineKpi.id, baselineEvidenceId.trim());
      setBaselineKpi(null);
      setBaselineEvidenceId("");
      setFeedback("Baseline KPI berhasil diajukan untuk verifikasi.");
      fetchData();
    } catch (err: any) {
      setFeedback(err.message || "Gagal mengajukan baseline");
    }
  };

  const handleVerifyBaselineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingKpi) return;

    setSubmitting(true);
    try {
      await verifyKPIBaseline(verifyingKpi.id, verifyStatus, verifyNotes);
      setVerifyingKpi(null);
      setVerifyNotes("");
      setFeedback(`Baseline KPI berhasil ditandai sebagai: ${verifyStatus === "approved" ? "Disetujui" : "Perlu Revisi"}`);
      fetchData();
    } catch (err: any) {
      setFeedback(err.message || "Gagal memverifikasi baseline");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      await deleteKPI(deletingId);
      setDeletingId(null);
      fetchData();
    } catch (err: any) {
      setFeedback(err.message || "Gagal menghapus KPI");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWorkflowSubmit = async (kpi: KPIItem) => {
    setSubmitting(true);
    setFeedback(null);
    try {
      const target = kpi.workflowStatus === "revision_requested_by_biro" ? "submitted_to_biro" : "submitted_to_bidang";
      await transitionWorkflow("kpi", kpi.id, target);
      setFeedback(target === "submitted_to_biro" ? "KPI diajukan ulang untuk review Biro." : "KPI diajukan ke Bidang.");
      await fetchData();
    } catch (err: any) {
      setFeedback(err.message || "KPI belum dapat diajukan.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredKPIs = kpis.filter((k) => {
    const matchesSearch =
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      (k.code && k.code.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !selectedStatus || k.baselineStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <SimakinShell activePath="/kpis">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-primary">
              Matriks Indikator Kinerja Utama (KPI)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Pengukuran target numerik, verifikasi baseline, dan pemantauan realisasi program kerja yayasan
            </p>
          </div>
          {canManageKpi && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="px-3.5 py-2 bg-white border border-border hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-rounded text-tertiary text-[18px]">upload_file</span>
                <span>Unggah Spreadsheet KPI</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3.5 py-2 bg-tertiary hover:bg-[#0b6355] text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-rounded text-[18px]">add</span>
                <span>+ Tambah KPI Baru</span>
              </button>
            </div>
          )}
        </div>
        {feedback && <p className="mt-4 rounded-sm border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900" role="status">{feedback}</p>}

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Cari indikator KPI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white text-primary"
            />
          </div>

          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-3 py-2 border border-border rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-primary"
          >
            <option value="">Semua Program Kerja</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] text-primary"
          >
            <option value="">Semua Status Baseline</option>
            <option value="draft">Draft (Belum Diajukan)</option>
            <option value="submitted">Diajukan (Menunggu Review)</option>
            <option value="approved">Disetujui (Approved)</option>
            <option value="revision_needed">Perlu Revisi</option>
          </select>
        </div>

        {/* Content Table */}
        <div className="mt-6">
          {loading ? (
            <LoadingState message="Memuat matriks indikator KPI..." />
          ) : error ? (
            <ErrorState
              title="Gagal Memuat KPI"
              message={error}
              onRetry={fetchData}
            />
          ) : filteredKPIs.length === 0 ? (
            <EmptyState
              title="Belum Ada Indikator KPI"
              description="Belum ada KPI yang cocok dengan filter yang Anda tentukan."
            />
          ) : (
            <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-xs text-left">
                  <thead className="bg-[#F7F8F8] text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th scope="col" className="px-5 py-3.5">Indikator KPI</th>
                      <th scope="col" className="px-5 py-3.5">Program Induk</th>
                      <th scope="col" className="px-5 py-3.5 text-center">Baseline</th>
                      <th scope="col" className="px-5 py-3.5 text-center">Target</th>
                      <th scope="col" className="px-5 py-3.5 text-center">Realisasi</th>
                      <th scope="col" className="px-5 py-3.5 text-center">Status Baseline</th>
                      <th scope="col" className="px-5 py-3.5 text-center">Workflow</th>
                      <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredKPIs.map((kpi) => {
                      const percent = kpi.target > 0 ? Math.round((kpi.realization / kpi.target) * 100) : 0;
                      return (
                        <tr key={kpi.id} className="hover:bg-[#fafbfb] transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-primary">{kpi.name}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                              <span className="capitalize">{kpi.indicatorType}</span>
                              <span>•</span>
                              <span>Bobot: {kpi.weight}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-700 max-w-xs truncate">
                            {kpi.program?.title || "-"}
                          </td>
                          <td className="px-5 py-4 text-center font-mono">
                            {kpi.baseline} {kpi.unit}
                          </td>
                          <td className="px-5 py-4 text-center font-mono font-semibold text-primary">
                            {kpi.target} {kpi.unit}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="font-mono font-bold text-tertiary">
                              {kpi.realization} {kpi.unit}
                            </span>
                            <span className="block text-[10px] text-gray-400">({percent}%)</span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <Badge
                              variant={
                                kpi.baselineStatus === "approved"
                                  ? "success"
                                  : kpi.baselineStatus === "submitted"
                                  ? "info"
                                  : kpi.baselineStatus === "revision_needed"
                                  ? "danger"
                                  : "neutral"
                              }
                            >
                              {kpi.baselineStatus === "approved"
                                ? "Disetujui"
                                : kpi.baselineStatus === "submitted"
                                ? "Diajukan"
                                : kpi.baselineStatus === "revision_needed"
                                ? "Perlu Revisi"
                                : "Draft"}
                            </Badge>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <WorkflowStatusBadge status={kpi.workflowStatus} />
                            <p className="mt-1 text-[10px] text-gray-400">{kpi.lastReviewedAt || kpi.submittedAt ? new Date(kpi.lastReviewedAt || kpi.submittedAt || "").toLocaleDateString("id-ID") : "Belum diajukan"}</p>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {canEditKpi(kpi) && (kpi.baselineStatus === "draft" || kpi.baselineStatus === "revision_needed") ? (
                                <button
                                  type="button"
                                  onClick={() => { setBaselineKpi(kpi); setBaselineEvidenceId(""); }}
                                  className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
                                  title="Ajukan baseline ke Admin Bidang"
                                >
                                  Ajukan
                                </button>
                              ) : null}

                              {kpi.baselineStatus === "submitted" && canVerifyBaseline ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVerifyingKpi(kpi);
                                    setVerifyStatus("approved");
                                    setVerifyNotes("");
                                  }}
                                  className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-300"
                                  title="Verifikasi baseline oleh Admin Bidang"
                                >
                                  Verifikasi
                                </button>
                              ) : null}

                              {canEditKpi(kpi) && (
                                <>
                                  <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => void handleWorkflowSubmit(kpi)}
                                    className="px-2 py-1 text-[11px] font-semibold text-white bg-tertiary hover:bg-emerald-700 rounded-sm disabled:opacity-50"
                                  >
                                    Ajukan
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(kpi)}
                                    className="px-2 py-1 text-[11px] font-semibold text-tertiary hover:bg-[#e6f4f1] rounded border border-emerald-200"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeletingId(kpi.id);
                                      setDeletingName(kpi.name);
                                    }}
                                    className="px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded border border-red-200"
                                  >
                                    Hapus
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal baseline evidence */}
        {baselineKpi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-lg border border-border bg-surface p-5">
              <h3 className="font-heading text-base font-bold text-primary">Ajukan baseline KPI</h3>
              <p className="mt-1 text-xs text-gray-500">{baselineKpi.name}. Tambahkan ID bukti jika baseline memerlukan bukti pendukung.</p>
              <label className="mt-4 block text-xs font-semibold text-primary" htmlFor="baseline-evidence-id">ID bukti dukung</label>
              <input id="baseline-evidence-id" value={baselineEvidenceId} onChange={(event) => setBaselineEvidenceId(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary" placeholder="Opsional" />
              <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setBaselineKpi(null)} className="rounded-sm border border-border px-3 py-2 text-xs font-semibold text-primary">Batal</button><button type="button" onClick={() => void handleSubmitBaseline()} className="rounded-sm bg-tertiary px-3 py-2 text-xs font-semibold text-on-tertiary">Ajukan baseline</button></div>
            </div>
          </div>
        )}

        {/* Modal Form Tambah / Edit KPI */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg max-w-lg w-full p-6 border border-border">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <h3 className="text-base font-bold font-heading text-primary">
                  {editingKpi ? "Edit Indikator KPI" : "Tambah KPI Baru"}
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
                    Program Kerja Induk *
                  </label>
                  <select
                    required
                    value={formData.programId}
                    onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white text-primary"
                  >
                    <option value="">Pilih Program Kerja</option>
                    {programs.filter((program) => manageableProgramIds.includes(program.id)).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Nama Indikator Capaian *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Persentase kelulusan sertifikasi guru"
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Target Numerik *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Baseline Awal
                    </label>
                    <input
                      type="number"
                      value={formData.baseline}
                      onChange={(e) => setFormData({ ...formData, baseline: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Satuan Ukur
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="%, Dokumen, Siswa"
                      className="w-full px-3 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Bobot Indikator (%)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Frekuensi Pengukuran
                    </label>
                    <select
                      value={formData.updateFrequency}
                      onChange={(e) => setFormData({ ...formData, updateFrequency: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white text-primary"
                    >
                      <option value="weekly">Mingguan</option>
                      <option value="monthly">Bulanan</option>
                      <option value="quarterly">Kuartal</option>
                      <option value="semester">Semester</option>
                      <option value="yearly">Tahunan</option>
                    </select>
                  </div>
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
                    {submitting ? "Menyimpan..." : "Simpan Indikator"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Verifikasi Baseline (Khusus Admin Bidang) */}
        {verifyingKpi && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg max-w-md w-full p-6 border border-border">
              <h3 className="text-base font-bold font-heading text-primary mb-1">
                Verifikasi Baseline KPI
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Tinjau pengajuan angka baseline untuk <strong>{verifyingKpi.name}</strong>.
              </p>

              <form onSubmit={handleVerifyBaselineSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Keputusan Evaluasi
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-primary cursor-pointer">
                      <input
                        type="radio"
                        name="verifyStatus"
                        value="approved"
                        checked={verifyStatus === "approved"}
                        onChange={() => setVerifyStatus("approved")}
                      />
                      <span>Setujui (Approved)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-primary cursor-pointer">
                      <input
                        type="radio"
                        name="verifyStatus"
                        value="revision_needed"
                        checked={verifyStatus === "revision_needed"}
                        onChange={() => setVerifyStatus("revision_needed")}
                      />
                      <span>Minta Revisi</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Catatan Evaluator / Feedback
                  </label>
                  <textarea
                    rows={3}
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    placeholder="Tuliskan catatan persetujuan atau alasan revisi..."
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setVerifyingKpi(null)}
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
                    {submitting ? "Memproses..." : "Kirim Keputusan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Impor Excel KPI */}
        <KpiUploadModal
          isOpen={isUploadOpen}
          programs={programs}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={fetchData}
        />

        {/* Modal Hapus */}
        <ConfirmModal
          isOpen={!!deletingId}
          title="Konfirmasi Hapus Indikator KPI"
          message={`Yakin ingin menghapus KPI "${deletingName}"? Data realisasi bulanan terkait indikator ini akan ikut terhapus.`}
          confirmLabel="Hapus KPI"
          loading={submitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingId(null)}
        />
      </div>
    </SimakinShell>
  );
}
