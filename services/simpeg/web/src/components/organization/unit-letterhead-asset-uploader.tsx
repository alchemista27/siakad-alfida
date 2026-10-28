"use client";

import { ChangeEvent, useRef, useState } from "react";

type AssetKind = "logo";

type Props = {
  kind: AssetKind;
  unitId: string;
  label: string;
  value: string | null;
  onChange: (url: string) => void;
  onRemove: () => void;
  onUploadingChange: (uploading: boolean) => void;
};

const rules: Record<AssetKind, { folder: (unitId: string) => string; accept: string; mimeTypes: string[] }> = {
  logo: {
    folder: (unitId) => `simpeg/unit/${unitId}/logo`,
    accept: "image/png,image/jpeg",
    mimeTypes: ["image/png", "image/jpeg"],
  },
};

function messageOf(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as { error?: { message?: unknown }; message?: unknown };
  if (typeof record.error?.message === "string") return record.error.message;
  if (typeof record.message === "string") return record.message;
  return fallback;
}

export function UnitLetterheadAssetUploader({ kind, unitId, label, value, onChange, onRemove, onUploadingChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const rule = rules[kind];

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!rule.mimeTypes.includes(file.type) || file.size <= 0 || file.size > 3 * 1024 * 1024) {
      setMessage("Format atau ukuran file tidak didukung. Maksimal 3 MB.");
      event.target.value = "";
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "hb1ropwm";
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "alfida_unsigned";
    try {
      setUploading(true);
      onUploadingChange(true);
      setMessage("Mengunggah aset...");
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", preset);
      data.append("folder", rule.folder(unitId));
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: data });
      const payload = await response.json().catch(() => null) as { secure_url?: unknown } | null;
      if (!response.ok || typeof payload?.secure_url !== "string") {
        throw new Error(messageOf(payload, "Upload Cloudinary gagal."));
      }
      onChange(payload.secure_url);
      setMessage("Upload selesai. Simpan profil unit untuk menerapkan perubahan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload aset gagal.");
    } finally {
      setUploading(false);
      onUploadingChange(false);
      event.target.value = "";
    }
  };

  return (
    <div className="rounded-md border border-border bg-neutral p-3">
      <p className="text-xs font-semibold text-primary">{label}</p>
      <div className="mt-2 flex h-24 items-center justify-center overflow-hidden rounded-sm border border-border bg-white p-2">
        {value ? <img src={value} alt={label} className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-slate-500">Belum diunggah</span>}
      </div>
      <input ref={inputRef} type="file" accept={rule.accept} className="sr-only" onChange={upload} disabled={uploading} />
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="rounded-sm border border-tertiary bg-white px-3 py-1.5 text-xs font-semibold text-tertiary disabled:opacity-60">{uploading ? "Mengunggah..." : value ? "Ganti File" : "Pilih File"}</button>
        {value && <button type="button" onClick={onRemove} disabled={uploading} className="rounded-sm border border-border bg-white px-3 py-1.5 text-xs font-semibold text-primary disabled:opacity-60">Hapus</button>}
      </div>
      {message && <p className="mt-2 text-xs text-slate-600" role="status">{message}</p>}
    </div>
  );
}
