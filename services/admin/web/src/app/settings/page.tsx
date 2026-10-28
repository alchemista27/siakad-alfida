"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin-shell";
import { FoundationAssetUploader } from "@/components/foundation-asset-uploader";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAssets, setUploadingAssets] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    foundationName: "Yayasan Alfida",
    logoUrl: "",
    faviconUrl: "",
    chairmanName: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountHolder: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/foundation-settings", {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setFormData({
              foundationName: json.data.foundationName || "Yayasan Alfida",
              logoUrl: json.data.logoUrl || "",
              faviconUrl: json.data.faviconUrl || "",
              chairmanName: json.data.chairmanName || "",
              bankName: json.data.bankName || "",
              bankAccountNumber: json.data.bankAccountNumber || "",
              bankAccountHolder: json.data.bankAccountHolder || "",
              address: json.data.address || "",
              phone: json.data.phone || "",
              email: json.data.email || "",
            });
          }
        }
      } catch (err: any) {
        setErrorMessage("Gagal memuat pengaturan identitas yayasan.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssetUploadingChange = (kind: "logo" | "favicon", isUploading: boolean) => {
    setUploadingAssets((current) => {
      const next = new Set(current);
      if (isUploading) next.add(kind);
      else next.delete(kind);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingAssets.size > 0) {
      setErrorMessage("Tunggu sampai semua upload aset selesai sebelum menyimpan perubahan.");
      return;
    }

    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/foundation-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Gagal menyimpan pengaturan.");
      }

      setSuccessMessage("Pengaturan tersimpan. Aset branding diterbitkan dari penyimpanan Yayasan.");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell activePath="/settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-2xl font-bold font-heading text-primary">
              Identitas Resmi & Rekening Yayasan
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Atur logo resmi, ikon favicon browser, nama ketua yayasan, dan rekening bank pusat.
            </p>
          </div>
          <button
            type="submit"
            form="foundation-settings-form"
            disabled={saving || loading || uploadingAssets.size > 0}
            className="px-5 py-2.5 rounded bg-tertiary hover:bg-[#0b6355] text-white font-semibold text-xs transition-colors flex items-center gap-2 self-start md:self-auto shadow-sm disabled:opacity-60"
          >
            <span className="material-symbols-rounded text-[18px]">
              {saving ? "sync" : "save"}
            </span>
            <span>{saving ? "Menyimpan Perubahan..." : "Simpan Perubahan"}</span>
          </button>
        </div>

        {/* Notifikasi Sukses / Gagal */}
        {successMessage && (
          <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-sm">
            <span className="material-symbols-rounded text-emerald-600 text-[20px]">
              check_circle
            </span>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 shadow-sm">
            <span className="material-symbols-rounded text-red-600 text-[20px]">
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-border">
            <span className="material-symbols-rounded animate-spin text-[32px] text-tertiary mb-2 block mx-auto">
              progress_activity
            </span>
            <p className="text-xs">Memuat data identitas yayasan...</p>
          </div>
        ) : (
          <form id="foundation-settings-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Bagian 1: Data Utama & Visual Branding */}
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold font-heading text-primary flex items-center gap-2 border-b border-border pb-3">
                <span className="material-symbols-rounded text-tertiary text-[20px]">
                  branding_watermark
                </span>
                <span>Visual Branding & Nama Yayasan</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Nama Resmi Yayasan *
                  </label>
                  <input
                    type="text"
                    name="foundationName"
                    required
                    value={formData.foundationName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="Contoh: Yayasan Alfida"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Ditampilkan pada Topbar seluruh microservice, kop surat, dan invoice resmi.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Nama Lengkap Ketua Yayasan (beserta Gelar)
                  </label>
                  <input
                    type="text"
                    name="chairmanName"
                    value={formData.chairmanName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="Contoh: Dr. H. Fulan, M.Pd."
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Dicatat sebagai identitas pimpinan yayasan untuk dokumen administratif.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <FoundationAssetUploader
                  kind="logo"
                  label="Logo Resmi Yayasan"
                  hint="PNG, WebP, atau SVG; maksimal 5 MB."
                  accept="image/png,image/webp,image/svg+xml"
                  value={formData.logoUrl}
                  onChange={(logoUrl) => setFormData((prev) => ({ ...prev, logoUrl }))}
                  onRemove={() => setFormData((prev) => ({ ...prev, logoUrl: "" }))}
                  onUploadingChange={(isUploading) => handleAssetUploadingChange("logo", isUploading)}
                />

                <FoundationAssetUploader
                  kind="favicon"
                  label="Favicon Browser Tab"
                  hint="ICO, PNG, atau SVG; maksimal 1 MB."
                  accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml"
                  value={formData.faviconUrl}
                  onChange={(faviconUrl) => setFormData((prev) => ({ ...prev, faviconUrl }))}
                  onRemove={() => setFormData((prev) => ({ ...prev, faviconUrl: "" }))}
                  onUploadingChange={(isUploading) => handleAssetUploadingChange("favicon", isUploading)}
                />
              </div>
            </div>

            {/* Bagian 2: Rekening Bank Terpusat */}
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold font-heading text-primary flex items-center gap-2 border-b border-border pb-3">
                <span className="material-symbols-rounded text-tertiary text-[20px]">
                  account_balance
                </span>
                <span>Rekening Bank Terpusat (PPDB / SPMB & SPP)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Nama Bank
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="Contoh: Bank Syariah Indonesia (BSI)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="Contoh: 7121234567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Atas Nama Rekening
                  </label>
                  <input
                    type="text"
                    name="bankAccountHolder"
                    value={formData.bankAccountHolder}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="Contoh: Yayasan Alfida"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Alamat & Kontak Resmi */}
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold font-heading text-primary flex items-center gap-2 border-b border-border pb-3">
                <span className="material-symbols-rounded text-tertiary text-[20px]">
                  contact_mail
                </span>
                <span>Kontak & Domisili Resmi</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Nomor Telepon Kantor
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="(0736) xxxxxx atau 0812xxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Email Resmi Kantor
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="sekretariat@alfida.or.id"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Alamat Lengkap Kantor Pusat
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="Jl. Merawan No. 1, Bengkulu"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end border-t border-border pt-5">
              <button
                type="submit"
                disabled={saving || loading || uploadingAssets.size > 0}
                className="rounded-sm bg-tertiary px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminShell>
  );
}
