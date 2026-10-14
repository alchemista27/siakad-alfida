"use client";

import React, { useState, useEffect } from "react";
import { SimakinShell } from "@/components/simakin-shell";
import { getEvidences, createEvidence } from "@/actions/strategic";
import { Badge, EmptyState, LoadingState, ErrorState } from "@alfida/ui";

interface EvidenceItem {
  id: string;
  departmentId?: string | null;
  title: string;
  type: "document" | "photo" | "link";
  url: string;
  nature: "mandatory" | "supporting";
  verificationStatus: "unverified" | "verified" | "needs_revision";
  createdAt: string;
  user?: { fullName: string };
  department?: { name: string };
}

export default function EvidencePage() {
  const [evidences, setEvidences] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "document" as "document" | "photo" | "link",
    url: "",
    nature: "supporting" as "mandatory" | "supporting",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvidences();
      setEvidences(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat bukti dukung");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;

    setSubmitting(true);
    try {
      await createEvidence(form);
      setIsModalOpen(false);
      setForm({
        title: "",
        type: "document",
        url: "",
        nature: "supporting",
      });
      fetchData();
    } catch (err: any) {
      alert("Error: " + (err.message || "Gagal menyimpan bukti dukung"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SimakinShell activePath="/evidence">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-primary">
              Bukti Dukung Kegiatan & Capaian (Evidence)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Repositori dokumen silabus, sertifikat, tautan publikasi, dan foto kegiatan penopang realisasi KPI
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-tertiary hover:bg-[#0b6355] text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-rounded text-[18px]">cloud_upload</span>
            <span>+ Unggah Bukti Dukung</span>
          </button>
        </div>

        {/* Content Grid */}
        <div className="mt-6">
          {loading ? (
            <LoadingState message="Memuat repositori bukti dukung..." />
          ) : error ? (
            <ErrorState
              title="Gagal Memuat Bukti"
              message={error}
              onRetry={fetchData}
            />
          ) : evidences.length === 0 ? (
            <EmptyState
              title="Belum Ada Bukti Dukung"
              description="Belum ada dokumen atau foto kegiatan yang diunggah untuk verifikasi capaian."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evidences.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white border border-border rounded-xl p-5 shadow-sm hover:border-emerald-200 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#e6f4f1] text-tertiary flex items-center justify-center">
                        <span className="material-symbols-rounded text-[20px]">
                          {ev.type === "photo"
                            ? "image"
                            : ev.type === "link"
                            ? "link"
                            : "description"}
                        </span>
                      </div>
                      <Badge
                        variant={
                          ev.verificationStatus === "verified"
                            ? "success"
                            : ev.verificationStatus === "needs_revision"
                            ? "danger"
                            : "neutral"
                        }
                      >
                        {ev.verificationStatus === "verified"
                          ? "Terverifikasi"
                          : ev.verificationStatus === "needs_revision"
                          ? "Perlu Revisi"
                          : "Menunggu Review"}
                      </Badge>
                    </div>

                    <h4 className="text-sm font-bold font-heading text-primary line-clamp-2">
                      {ev.title}
                    </h4>
                    <div className="text-[11px] text-gray-400 mt-1">
                      {new Date(ev.createdAt).toLocaleDateString("id-ID")}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      {ev.nature === "mandatory" ? "Wajib" : "Pendukung"}
                    </span>
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary hover:underline"
                    >
                      <span>Buka Bukti</span>
                      <span className="material-symbols-rounded text-[14px]">open_in_new</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Unggah Bukti */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-border">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <h3 className="text-base font-bold font-heading text-primary">
                  Unggah Bukti Dukung Baru
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-rounded text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateEvidence} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Nama / Judul Bukti Dukung *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Contoh: Dokumen Silabus Kurikulum Al-Quran"
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Jenis Bukti
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white text-primary"
                    >
                      <option value="document">Dokumen / PDF</option>
                      <option value="photo">Foto / Gambar</option>
                      <option value="link">Tautan Luar / Link</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Sifat Berkas
                    </label>
                    <select
                      value={form.nature}
                      onChange={(e) => setForm({ ...form, nature: e.target.value as any })}
                      className="w-full px-3 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white text-primary"
                    >
                      <option value="supporting">Pendukung</option>
                      <option value="mandatory">Wajib (Mandatory)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Tautan URL Berkas (Cloudinary / MinIO S3) *
                  </label>
                  <input
                    type="url"
                    required
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Masukkan URL file yang telah diunggah ke MinIO S3 atau Cloudinary.
                  </p>
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
                    {submitting ? "Menyimpan..." : "Simpan Bukti"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SimakinShell>
  );
}
