"use client";

import { ChangeEvent, useRef, useState } from "react";

type FoundationAssetKind = "logo" | "favicon" | "chairman_signature";

type FoundationAssetUploaderProps = {
  kind: FoundationAssetKind;
  label: string;
  hint: string;
  accept: string;
  value: string;
  onChange: (publicUrl: string) => void;
  onRemove: () => void;
  onUploadingChange?: (isUploading: boolean) => void;
};

const assetRules: Record<FoundationAssetKind, {
  folder: string;
  maxBytes: number;
  mimeTypes: readonly string[];
  emptyIcon: string;
}> = {
  logo: {
    folder: "foundation/logo",
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/png", "image/webp", "image/svg+xml"],
    emptyIcon: "image",
  },
  favicon: {
    folder: "foundation/favicon",
    maxBytes: 1 * 1024 * 1024,
    mimeTypes: ["image/png", "image/x-icon", "image/vnd.microsoft.icon", "image/svg+xml"],
    emptyIcon: "tab",
  },
  chairman_signature: {
    folder: "foundation/chairman-signature",
    maxBytes: 3 * 1024 * 1024,
    mimeTypes: ["image/png", "image/webp"],
    emptyIcon: "draw",
  },
};

function readErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.filter((item): item is string => typeof item === "string").join(", ");
  }
  if (typeof payload === "object" && payload && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string") return error;
  }
  return fallback;
}

export function FoundationAssetUploader({
  kind,
  label,
  hint,
  accept,
  value,
  onChange,
  onRemove,
  onUploadingChange,
}: FoundationAssetUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const rule = assetRules[kind];
  const isUploading = status === "uploading";

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage("");
    setPreviewError(false);

    if (!rule.mimeTypes.includes(file.type)) {
      setStatus("error");
      setMessage("Format file tidak didukung untuk aset ini.");
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
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_FOUNDATION_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      setStatus("error");
      setMessage("Konfigurasi upload Cloudinary belum tersedia.");
      event.target.value = "";
      return;
    }

    try {
      setStatus("uploading");
      setMessage("Mengunggah ke Cloudinary...");
      onUploadingChange?.(true);

      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", uploadPreset);
      data.append("folder", rule.folder);
      const response = await fetch(endpoint, { method: "POST", body: data });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok || typeof (payload as { secure_url?: unknown } | null)?.secure_url !== "string") {
        throw new Error(readErrorMessage(payload, "Upload Cloudinary gagal."));
      }

      onChange((payload as { secure_url: string }).secure_url);
      setStatus("success");
      setMessage("Upload selesai. Klik Simpan Perubahan untuk menyimpan aset.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload aset yayasan gagal.");
    } finally {
      onUploadingChange?.(false);
      event.target.value = "";
    }
  };

  const handleRemove = () => {
    if (isUploading) return;
    onRemove();
    setPreviewError(false);
    setStatus("idle");
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-neutral flex flex-col gap-3">
      <div>
        <label className="block text-xs font-semibold text-primary mb-1">{label}</label>
        <p className="text-[11px] text-gray-600 min-h-8">{hint}</p>
      </div>

      <div className="h-28 bg-white rounded border border-border flex items-center justify-center p-2 overflow-hidden">
        {value && !previewError ? (
          kind === "favicon" ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-neutral max-w-full">
              <img
                src={value}
                alt={label}
                className="w-7 h-7 object-contain shrink-0"
                onError={() => setPreviewError(true)}
              />
              <span className="text-[10px] text-gray-700 font-mono truncate">Browser Tab Preview</span>
            </div>
          ) : (
            <img
              src={value}
              alt={label}
              className="max-h-full max-w-full object-contain"
              onError={() => setPreviewError(true)}
            />
          )
        ) : (
          <span className="material-symbols-rounded text-gray-400 text-[40px]">{rule.emptyIcon}</span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 px-3 py-2 text-xs font-semibold rounded border border-tertiary text-tertiary bg-white hover:bg-[#eef7f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary disabled:opacity-60"
        >
          {isUploading ? "Mengunggah..." : value ? "Ganti File" : "Pilih File"}
        </button>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            className="px-3 py-2 text-xs font-semibold rounded border border-border text-gray-700 bg-white hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary disabled:opacity-60"
          >
            Hapus
          </button>
        )}
      </div>

      {message && (
        <p className={`text-[11px] ${status === "error" ? "text-red-700" : status === "success" ? "text-tertiary" : "text-gray-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
