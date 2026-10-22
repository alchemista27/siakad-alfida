"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Button } from "@alfida/ui";
import { apiFetch } from "@/lib/api";
import { NotificationModal } from "./notification-modal";

interface UploadResult {
  secure_url: string;
  public_id: string;
  resource_type: "image" | "video" | "raw";
  original_filename?: string;
  bytes?: number;
}

export function YmqProgressEvidenceUploader({ progressId, groupId, sessionId, disabled, onAttached }: {
  progressId: string;
  groupId: string;
  sessionId: string;
  disabled?: boolean;
  onAttached?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string; tone: "success" | "error" } | null>(null);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_YMQ_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "alfida_unsigned";
    if (!cloudName) {
      setNotice({ title: "Unggahan belum siap", message: "Konfigurasi Cloudinary belum tersedia pada aplikasi ini.", tone: "error" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", `siyaum/ymq/${groupId}/${sessionId}`);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: "POST", body: formData });
      const payload = await response.json().catch(() => null) as { error?: { message?: string } } & Partial<UploadResult>;
      if (!response.ok || !payload.secure_url || !payload.public_id || !payload.resource_type) {
        throw new Error(payload.error?.message || "Cloudinary tidak mengembalikan metadata file yang valid.");
      }

      await apiFetch(`/learning-progress/${progressId}/evidence`, {
        method: "POST",
        body: JSON.stringify({
          secureUrl: payload.secure_url,
          publicId: payload.public_id,
          resourceType: payload.resource_type,
          originalFilename: payload.original_filename,
          bytes: payload.bytes,
        }),
      });
      onAttached?.();
      setNotice({ title: "Bukti pembelajaran terpasang", message: "Metadata bukti telah divalidasi dan dicatat oleh SIYAUM.", tone: "success" });
    } catch (error) {
      setNotice({ title: "Bukti belum terpasang", message: error instanceof Error ? error.message : "Unggahan bukti gagal. Silakan coba lagi.", tone: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" className="sr-only" onChange={upload} accept="image/*,video/*,audio/*,application/pdf" disabled={disabled || isUploading} />
      <Button type="button" variant="outline" size="sm" disabled={disabled || isUploading} onClick={() => inputRef.current?.click()}>
        <span className="material-symbols-rounded mr-1 text-base" aria-hidden="true">attach_file</span>
        {isUploading ? "Mengunggah…" : "Lampirkan bukti"}
      </Button>
      <NotificationModal open={Boolean(notice)} title={notice?.title || ""} message={notice?.message || ""} tone={notice?.tone} onClose={() => setNotice(null)} />
    </>
  );
}
