"use client";

import { FormEvent, useState } from "react";
import { OrganizationUnit, responseMessage } from "./types";
import { UnitLetterheadAssetUploader } from "./unit-letterhead-asset-uploader";

type Props = {
  unit: OrganizationUnit;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

export function UnitLetterheadProfileModal({ unit, onClose, onSaved }: Props) {
  const [logoUrl, setLogoUrl] = useState(unit.logoUrl || "");
  const [principalName, setPrincipalName] = useState(unit.principalName || "");
  const [principalSignatureUrl, setPrincipalSignatureUrl] = useState(unit.principalSignatureUrl || "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/units/${unit.id}/letterhead-profile`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          logoUrl: logoUrl.trim() || null,
          principalName: principalName.trim() || null,
          principalSignatureUrl: principalSignatureUrl.trim() || null,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseMessage(payload, "Profil unit gagal disimpan."));
      await onSaved();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Profil unit gagal disimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="unit-letterhead-title">
      <form onSubmit={submit} className="w-full max-w-2xl rounded-md border border-border bg-surface p-5">
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <h3 id="unit-letterhead-title" className="font-heading text-lg font-bold text-primary">Profil Unit — Kop Surat</h3>
            <p className="mt-1 text-xs text-slate-500">Data ini dipakai untuk surat pengantar pemeriksaan kesehatan SPMB.</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500" aria-label="Tutup profil unit"><span className="material-symbols-rounded" aria-hidden="true">close</span></button>
        </div>
        {error && <p className="mt-4 rounded-sm border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</p>}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <UnitLetterheadAssetUploader kind="logo" unitId={unit.id} label="Logo Unit" value={logoUrl || null} onChange={setLogoUrl} onRemove={() => setLogoUrl("")} onUploadingChange={setUploading} />
          <UnitLetterheadAssetUploader kind="principalSignature" unitId={unit.id} label="Tanda Tangan Kepala Sekolah" value={principalSignatureUrl || null} onChange={setPrincipalSignatureUrl} onRemove={() => setPrincipalSignatureUrl("")} onUploadingChange={setUploading} />
        </div>
        <label className="mt-4 block text-xs font-semibold text-primary">Nama Kepala Sekolah<input required value={principalName} onChange={(event) => setPrincipalName(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" /></label>
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} disabled={submitting || uploading} className="rounded-sm border border-border bg-white px-3 py-2 text-xs font-semibold text-primary disabled:opacity-60">Batal</button><button type="submit" disabled={submitting || uploading} className="rounded-sm bg-tertiary px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan Profil Unit"}</button></div>
      </form>
    </div>
  );
}
