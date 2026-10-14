"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { batchImportKpisAction } from "@/actions/strategic";

interface KpiUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  programs: { id: string; title: string }[];
}

export function downloadKpiTemplate(programs?: { title: string }[]) {
  const sampleProg1 = programs && programs.length > 0 ? programs[0].title : "Peningkatan Mutu SDM";
  const sampleProg2 = programs && programs.length > 1 ? programs[1].title : "Optimalisasi Layanan Digital";

  const templateData = [
    {
      "Program Induk": sampleProg1,
      "Nama Indikator": "Persentase kelulusan sertifikasi kompetensi",
      "Tipe Indikator": "Output",
      "Arah Target": "Lebih Tinggi Lebih Baik",
      "Target Angka": "100",
      "Satuan": "%",
      "Bobot": "50",
      "Frekuensi Update": "Tahunan",
      "Email PIC": "pic@alfida.or.id",
    },
    {
      "Program Induk": sampleProg2,
      "Nama Indikator": "Jumlah komplain sistem dari unit",
      "Tipe Indikator": "Outcome",
      "Arah Target": "Lebih Rendah Lebih Baik",
      "Target Angka": "5",
      "Satuan": "Komplain",
      "Bobot": "30",
      "Frekuensi Update": "Bulanan",
      "Email PIC": "",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  worksheet["!cols"] = [
    { wch: 35 }, // Program Induk
    { wch: 45 }, // Nama Indikator
    { wch: 15 }, // Tipe Indikator
    { wch: 25 }, // Arah Target
    { wch: 15 }, // Target Angka
    { wch: 15 }, // Satuan
    { wch: 10 }, // Bobot
    { wch: 20 }, // Frekuensi Update
    { wch: 30 }, // Email PIC
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "KPI");
  XLSX.writeFile(workbook, "Template_KPI_Alfida.xlsx");
}

export function KpiUploadModal({ isOpen, onClose, onSuccess, programs }: KpiUploadModalProps) {
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

      const res = await batchImportKpisAction(data);
      if (res && res.success) {
        alert(`Berhasil mengimpor ${res.count} KPI!`);
        onSuccess();
        onClose();
      } else {
        throw new Error(res?.message || "Gagal mengimpor KPI.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengimpor KPI.");
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
              Unggah Indikator KPI (Batch Import)
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
                Unduh template resmi agar nama program induk dan target sesuai.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadKpiTemplate(programs)}
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
              <span>Terdeteksi <strong>{previewCount}</strong> baris indikator KPI siap diimpor.</span>
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
