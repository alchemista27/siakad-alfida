"use client";

import { useState } from "react";
import { CloudinaryUploadButton } from "@/components/cloudinary-upload-button";
import { createEvidence, transitionWorkflow } from "@/actions/strategic";

interface PicEvidenceUploaderProps {
  programId: string;
  taskId: string;
  onCreated: (evidenceId: string) => void;
}

export function PicEvidenceUploader({ programId, taskId, onCreated }: PicEvidenceUploaderProps) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const saveEvidence = async () => {
    if (!url.trim() || !name.trim()) {
      setFeedback("Unggah berkas dan isi nama bukti terlebih dahulu.");
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const evidence = await createEvidence({
        programId,
        taskId,
        name: name.trim(),
        type: "document",
        nature: "supporting",
        digitalLink: url.trim(),
      }) as { id: string };
      await transitionWorkflow("evidence", evidence.id, "submitted_to_biro");
      onCreated(evidence.id);
      setFeedback("Bukti telah dikirim ke review Biro.");
    } catch (caught) {
      setFeedback(caught instanceof Error ? caught.message : "Bukti belum dapat disimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-sm border border-border bg-neutral p-3">
      <p className="text-xs font-semibold text-primary">Bukti dukung</p>
      <div className="mt-2 space-y-2">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama bukti" className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-primary outline-none focus:ring-2 focus:ring-tertiary" />
        <CloudinaryUploadButton onUploadSuccess={(uploadedUrl, fileName) => { setUrl(uploadedUrl); setName((current) => current || fileName || ""); }} buttonText="Unggah bukti ke Cloudinary" />
        {url && <p className="break-all text-[11px] text-gray-500">Berkas siap dikirim dari Cloudinary.</p>}
        <button type="button" onClick={() => void saveEvidence()} disabled={saving} className="rounded-sm border border-tertiary px-3 py-2 text-xs font-semibold text-tertiary hover:bg-[#e6f4f1] disabled:opacity-50">{saving ? "Menyimpan..." : "Kirim bukti ke Biro"}</button>
      </div>
      {feedback && <p className="mt-2 text-xs text-gray-600" role="status">{feedback}</p>}
    </div>
  );
}
