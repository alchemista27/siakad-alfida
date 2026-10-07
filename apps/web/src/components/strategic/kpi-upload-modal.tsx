"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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

  // Set column widths for readability
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
      if (res.success) {
        alert(`Berhasil mengimpor ${res.count} KPI!`);
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Gagal mengimpor KPI.");
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat memproses data import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import KPI (Batch Excel)">
      <div className="p-6 space-y-5">
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <Icon name="lightbulb" className="text-amber-600 text-sm" />
            <span>Petunjuk Import:</span>
          </div>
          <p>
            1. Unduh template resmi Excel di bawah agar susunan kolom sesuai dengan basis data.
          </p>
          <p>
            2. Pastikan kolom <strong>Program Induk</strong> terisi dengan nama program yang terdaftar di SIM Alfida.
          </p>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-border">
          <span className="text-sm font-medium text-gray-700">Format Template:</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadKpiTemplate(programs)}
            className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-white hover:bg-emerald-600 border-emerald-600 bg-emerald-50 transition-colors shadow-sm"
          >
            <Icon name="download" className="text-sm" />
            Unduh Template Excel (.xlsx)
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200 flex items-center gap-2">
            <Icon name="error" className="text-base text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Pilih File Excel (.xlsx / .xls)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileChange}
            className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-tertiary file:text-on-tertiary hover:file:opacity-90 border border-border rounded-lg p-2"
          />
          {previewCount !== null && (
            <p className="text-xs text-emerald-700 font-medium">
              ✓ Terdeteksi <strong>{previewCount} baris</strong> KPI dalam file.
            </p>
          )}
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!file || loading}
            onClick={handleUpload}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Icon name="progress_activity" className="animate-spin text-sm" />
                Mengimpor...
              </>
            ) : (
              <>
                <Icon name="upload" className="text-sm" />
                Upload & Simpan
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
