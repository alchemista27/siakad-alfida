"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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

  // Set column widths for readability
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
      if (res.success) {
        alert(`Berhasil mengimpor ${res.count} program kerja!`);
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Gagal mengimpor program kerja.");
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat memproses data import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Program Kerja (Batch Excel)">
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
            2. Pastikan kolom <strong>Nama Program</strong> dan <strong>Nama Bidang / Biro</strong> terisi dengan nama yang terdaftar di SIM Alfida.
          </p>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-border">
          <span className="text-sm font-medium text-gray-700">Format Template:</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadWorkProgramTemplate(departments)}
            className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300"
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
              ✓ Terdeteksi <strong>{previewCount} baris</strong> program kerja dalam file.
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
