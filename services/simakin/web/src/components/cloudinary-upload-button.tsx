"use client";

import React, { useState } from "react";

interface CloudinaryUploadButtonProps {
  onUploadSuccess: (url: string, fileName?: string) => void;
  buttonText?: string;
  accept?: string;
  className?: string;
}

export function CloudinaryUploadButton({
  onUploadSuccess,
  buttonText = "Unggah Berkas ke Cloudinary",
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx",
  className,
}: CloudinaryUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "hb1ropwm";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "alfida_unsigned";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Ukuran file maksimal 15MB!");
      e.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Gagal mengunggah berkas ke Cloudinary");
      }

      const secureUrl = data.secure_url;
      setUploadedUrl(secureUrl);
      onUploadSuccess(secureUrl, file.name);
    } catch (err: any) {
      alert("Error upload: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded border border-border bg-white hover:bg-gray-50 text-xs font-semibold cursor-pointer transition-all shadow-sm select-none ${
          uploading ? "opacity-60 cursor-not-allowed" : ""
        } ${className || ""}`}
      >
        <span className="material-symbols-rounded text-tertiary text-[18px]">
          {uploading ? "sync" : "cloud_upload"}
        </span>
        <span>{uploading ? "Sedang Mengunggah..." : buttonText}</span>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {uploadedUrl && (
        <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded flex items-center gap-1.5 truncate max-w-sm">
          <span className="material-symbols-rounded text-emerald-600 text-[14px]">check_circle</span>
          <span className="truncate">Tersimpan: {uploadedUrl}</span>
        </div>
      )}
    </div>
  );
}
