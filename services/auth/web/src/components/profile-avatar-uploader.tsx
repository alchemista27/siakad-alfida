"use client";

import { ChangeEvent, useRef, useState } from "react";

type ProfileAvatarUploaderProps = {
  userId: string;
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
};

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 3 * 1024 * 1024;

function messageOf(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as { error?: { message?: unknown }; message?: unknown };
  if (typeof record.error?.message === "string") return record.error.message;
  if (typeof record.message === "string") return record.message;
  return fallback;
}

export function ProfileAvatarUploader({ userId, value, onChange, disabled = false }: ProfileAvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage(null);
    setPreviewFailed(false);
    if (!ACCEPTED_TYPES.includes(file.type) || file.size <= 0 || file.size > MAX_BYTES) {
      setMessage("Foto harus berformat PNG, JPEG, atau WebP dengan ukuran maksimal 3 MB.");
      event.target.value = "";
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const folder = `auth/user/${userId}/avatar`;
    if (!cloudName || !uploadPreset) {
      setMessage("Konfigurasi upload foto profil belum tersedia.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setMessage("Mengunggah foto profil...");
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", uploadPreset);
      data.append("folder", folder);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: data,
      });
      const payload: unknown = await response.json().catch(() => null);
      const secureUrl = (payload as { secure_url?: unknown } | null)?.secure_url;
      if (!response.ok || typeof secureUrl !== "string") {
        throw new Error(messageOf(payload, "Upload foto profil gagal."));
      }
      onChange(secureUrl);
      setMessage("Foto siap disimpan bersama perubahan profil.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload foto profil gagal.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const unavailable = disabled || uploading;

  return (
    <div className="rounded-md border border-border bg-neutral p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-white text-tertiary">
          {value && !previewFailed ? (
            <img src={value} alt="Foto profil" className="h-full w-full object-cover" onError={() => setPreviewFailed(true)} />
          ) : (
            <span className="material-symbols-rounded text-[34px]">person</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary">Foto Profil</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-600">PNG, JPEG, atau WebP. Maksimal 3 MB.</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={handleFileChange}
            disabled={unavailable}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={unavailable}
              className="rounded-sm border border-tertiary bg-white px-3 py-1.5 text-xs font-semibold text-tertiary transition-colors hover:bg-[#eef7f5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Mengunggah..." : value ? "Ganti Foto" : "Pilih Foto"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setPreviewFailed(false);
                  setMessage("Foto akan dihapus setelah perubahan profil disimpan.");
                }}
                disabled={unavailable}
                className="rounded-sm border border-border bg-white px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hapus Foto
              </button>
            )}
          </div>
          {message && <p role="status" className="mt-2 text-xs text-gray-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}
