"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { InlineNotice } from "@/components/inline-notice";

type UnitAssetKind = "logo" | "principalSignature";

type UnitAssetUploaderProps = {
  kind: UnitAssetKind;
  unitId: string;
  label: string;
  hint: string;
  value: string | null;
  onUploaded: (secureUrl: string) => void;
  disabled?: boolean;
};

const assetRules: Record<UnitAssetKind, {
  folder: (unitId: string) => string;
  accept: string;
  maxBytes: number;
  mimeTypes: readonly string[];
  icon: string;
}> = {
  logo: {
    folder: (unitId) => `units/${unitId}/logo`,
    accept: "image/png,image/jpeg,image/webp",
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    icon: "image",
  },
  principalSignature: {
    folder: (unitId) => `units/${unitId}/principal-signature`,
    accept: "image/png,image/jpeg,image/webp",
    maxBytes: 3 * 1024 * 1024,
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    icon: "draw",
  },
};

function readUploadError(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (typeof payload === "object" && payload && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.filter((item): item is string => typeof item === "string").join(", ");
  }
  if (typeof payload === "object" && payload && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string") return error;
    if (typeof error === "object" && error && "message" in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
  }
  return fallback;
}

export function UnitAssetUploader({
  kind,
  unitId,
  label,
  hint,
  value,
  onUploaded,
  disabled = false,
}: UnitAssetUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const rule = assetRules[kind];
  const uploading = status === "uploading";

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage("");
    if (!unitId) {
      setStatus("error");
      setMessage("Identitas unit belum tersedia. Muat ulang halaman lalu coba lagi.");
      event.target.value = "";
      return;
    }
    if (!rule.mimeTypes.includes(file.type)) {
      setStatus("error");
      setMessage("Gunakan file PNG, JPEG, atau WebP.");
      event.target.value = "";
      return;
    }
    if (file.size <= 0 || file.size > rule.maxBytes) {
      setStatus("error");
      setMessage(`Ukuran file maksimal ${Math.round(rule.maxBytes / 1024 / 1024)} MB.`);
      event.target.value = "";
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UNIT_UPLOAD_PRESET ||
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      "alfida_unsigned";

    if (!cloudName) {
      setStatus("error");
      setMessage("Konfigurasi Cloudinary belum tersedia.");
      event.target.value = "";
      return;
    }

    try {
      setStatus("uploading");
      setMessage("Mengunggah file ke penyimpanan aman…");
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", uploadPreset);
      data.append("folder", rule.folder(unitId));

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: data,
      });
      const payload: unknown = await response.json().catch(() => null);
      const secureUrl = (payload as { secure_url?: unknown } | null)?.secure_url;
      if (!response.ok || typeof secureUrl !== "string") {
        throw new Error(readUploadError(payload, "Upload Cloudinary gagal."));
      }

      onUploaded(secureUrl);
      setStatus("success");
      setMessage("Upload selesai. Simpan perubahan untuk memperbarui identitas unit.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload aset gagal.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <section className="rounded-lg border border-[#E3E8E7] bg-[#F7F8F8] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#454545]">{label}</h3>
          <p className="mt-1 text-sm leading-5 text-[#454545]/70">{hint}</p>
        </div>
        <span className="material-symbols-rounded text-[#0f7f6d]" aria-hidden="true">{rule.icon}</span>
      </div>

      <div className="mt-4 flex h-36 items-center justify-center overflow-hidden rounded border border-[#E3E8E7] bg-white p-3">
        {value ? <img src={value} alt={`Pratinjau ${label}`} className="h-full max-w-full object-contain" /> : <span className="text-sm text-[#454545]/55">Belum ada file</span>}
      </div>

      <input ref={inputRef} type="file" accept={rule.accept} className="sr-only" onChange={handleFileChange} disabled={disabled || uploading} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="mt-4 inline-flex items-center gap-2 rounded border border-[#0f7f6d] bg-white px-4 py-3 text-sm font-semibold text-[#0f7f6d] hover:bg-[#0f7f6d]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f7f6d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="material-symbols-rounded text-[18px]" aria-hidden="true">upload</span>
        {uploading ? "Mengunggah…" : value ? "Ganti file" : "Pilih file"}
      </button>

      {message ? <div className="mt-3"><InlineNotice tone={status === "error" ? "error" : status === "success" ? "success" : "info"}>{message}</InlineNotice></div> : null}
    </section>
  );
}
