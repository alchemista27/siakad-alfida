"use client";

import { useState, useRef } from "react";
import { batchImportUsers } from "@/actions/users";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

export function UserUploadClient() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("Harap unggah file berformat CSV atau XLSX.");
      return;
    }

    const confirmImport = confirm(`Apakah Anda yakin ingin mengimpor pengguna dari ${file.name}?`);
    if (!confirmImport) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setLoading(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
      
      const res = await batchImportUsers(jsonData);
      
      if (res.success) {
        alert(`Berhasil! ${res.imported} pengguna telah diimpor/diperbarui.`);
      } else {
        alert(`Gagal: ${res.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat membaca file.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        variant="outline"
      >
        <span className="material-symbols-rounded mr-2 text-[20px]">upload_file</span>
        {loading ? "Memproses..." : "Upload Pegawai"}
      </Button>
    </div>
  );
}
