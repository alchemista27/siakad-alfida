"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { batchImportProgramsAction } from "@/actions/strategic";

interface ProgramUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departments: { id: string; name: string }[];
}

export function downloadWorkProgramTemplate(departments?: { name: string }[]) {
  const sampleDept1 = departments && departments.length > 0 ? departments[0].name : "Bidang Pendidikan";
  const sampleDept2 = departments && departments.length > 1 ? departments[1].name : "Biro SDM";

  const templateData = [
    {
      "Nama Program": "Peningkatan Standar Kelulusan & Mutu Akademik",
      "Nama Bidang / Biro": sampleDept1,
      "Deskripsi": "Program penguatan kompetensi literasi, numerasi, dan kurikulum holistik siswa",
      "Email Koordinator / PIC": "pic.akademik@alfida.or.id",
      "Prioritas": "high",
      "Status": "planned",
      "Tujuan Program": "Meningkatkan persentase siswa berprestasi di tingkat provinsi",
      "Sasaran Target": "Seluruh unit jenjang TK hingga SMA",
      "Output Utama": "Laporan evaluasi capaian kurikulum & dokumen silabus terintegrasi",
      "Outcome yang Diharapkan": "Peningkatan rata-rata nilai asesmen nasional minimal 15%",
    },
    {
      "Nama Program": "Pelatihan dan Sertifikasi Guru Qur'an",
      "Nama Bidang / Biro": sampleDept2,
      "Deskripsi": "Pelatihan tajwid bersanad dan metode tahsin mutqin untuk tenaga pendidik",
      "Email Koordinator / PIC": "",
      "Prioritas": "medium",
      "Status": "planned",
      "Tujuan Program": "Menstandarisasi sanad bacaan guru Al-Qur'an",
      "Sasaran Target": "40 Guru PAI dan Ustadz BPI",
      "Output Utama": "Sertifikat kompetensi pengajar Qur'an",
      "Outcome yang Diharapkan": "100% guru pengajar tersertifikasi standar mutu Yayasan",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  worksheet["!cols"] = [
    { wch: 40 }, // Nama Program
    { wch: 25 }, // Nama Bidang / Biro
    { wch: 45 }, // Deskripsi
    { wch: 30 }, // Email Koordinator / PIC
    { wch: 12 }, // Prioritas
    { wch: 12 }, // Status
    { wch: 35 }, // Tujuan Program
    { wch: 30 }, // Sasaran Target
    { wch: 35 }, // Output Utama
    { wch: 35 }, // Outcome yang Diharapkan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Program_Kerja");
  XLSX.writeFile(workbook, "Template_Program_Kerja_Alfida.xlsx");
}

export function ProgramUploadModal({ isOpen, onClose, onSuccess, departments }: ProgramUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls") && !selectedFile.name.endsWith(".csv")) {
      setError("Harap unggah file spreadsheet berekstensi .xlsx, .xls, atau .csv");
      setFile(null);
      setPreviewCount(null);
      return;
    }

    setError(null);
    setFile(selectedFile);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setPreviewCount(data.length);
    } catch (err: any) {
      setError("Gagal membaca isi file spreadsheet.");
      setPreviewCount(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (data.length === 0) {
        setError("File spreadsheet tidak memiliki baris data.");
        setLoading(false);
        return;
      }

      const res = await batchImportProgramsAction(data);
      if (res && res.success) {
        alert(`Berhasil mengimpor ${res.count} program kerja!`);
        onSuccess();
        onClose();
      } else {
        throw new Error(res?.message || "Gagal mengimpor program kerja.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-border">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-tertiary text-[22px]">upload_file</span>
            <h3 className="text-base font-bold font-heading text-primary">
              Unggah Program Kerja (Batch Import)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <span className="material-symbols-rounded text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-4 my-5">
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-emerald-950">Gunakan format baku</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Unduh template resmi agar penamaan kolom sesuai standar sistem.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadWorkProgramTemplate(departments)}
              className="px-3 py-1.5 bg-white border border-emerald-300 text-tertiary hover:bg-emerald-50 rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors flex-shrink-0"
            >
              <span className="material-symbols-rounded text-[16px]">download</span>
              <span>Unduh Template</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">
              Pilih Berkas Excel / CSV
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#e6f4f1] file:text-tertiary hover:file:bg-emerald-100 border border-border rounded p-1 cursor-pointer"
            />
          </div>

          {previewCount !== null && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex items-center gap-2">
              <span className="material-symbols-rounded text-emerald-600 text-[18px]">check_circle</span>
              <span>Terdeteksi <strong>{previewCount}</strong> baris program kerja siap diimpor.</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <span className="material-symbols-rounded text-red-600 text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded border border-border transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || !file}
            className="px-4 py-2 text-xs font-semibold text-white bg-tertiary hover:bg-[#0b6355] rounded shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? (
              <span>Mengimpor...</span>
            ) : (
              <>
                <span className="material-symbols-rounded text-[16px]">publish</span>
                <span>Mulai Impor</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
