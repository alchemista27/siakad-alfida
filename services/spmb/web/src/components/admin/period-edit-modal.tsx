"use client";

import { FormEvent, useState } from "react";
import type { AdminPeriodItem } from "./period-management-panel";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Props = {
  period: AdminPeriodItem;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onNotify: (type: "success" | "error", message: string) => void;
};

function dateValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function errorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const message = (payload as { message?: unknown }).message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return fallback;
}

export function PeriodEditModal({ period, onClose, onSaved, onNotify }: Props) {
  const [label, setLabel] = useState(period.label);
  const [sourceAcademicYearId, setSourceAcademicYearId] = useState(period.sourceAcademicYearId || "");
  const [quota, setQuota] = useState(String(period.quota));
  const [fee, setFee] = useState(String(period.fee ?? 0));
  const [bankName, setBankName] = useState(period.bankName || "");
  const [bankNumber, setBankNumber] = useState(period.bankNumber || "");
  const [bankHolder, setBankHolder] = useState(period.bankHolder || "");
  const [opensAt, setOpensAt] = useState(dateValue(period.opensAt));
  const [closesAt, setClosesAt] = useState(dateValue(period.closesAt));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const academicYearId = sourceAcademicYearId.trim();
    if (academicYearId && !UUID_REGEX.test(academicYearId)) {
      setError("ID Tahun Ajaran SIAKAD harus berupa UUID yang valid atau dikosongkan.");
      return;
    }
    const parsedQuota = Number(quota);
    const parsedFee = Number(fee);
    if (!Number.isInteger(parsedQuota) || parsedQuota < 1) {
      setError("Kuota harus berupa bilangan bulat minimal 1.");
      return;
    }
    if (!Number.isInteger(parsedFee) || parsedFee < 0) {
      setError("Biaya formulir harus berupa bilangan bulat minimal 0.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/periods/${encodeURIComponent(period.id)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          sourceAcademicYearId: academicYearId || null,
          quota: parsedQuota,
          fee: parsedFee,
          bankName: bankName.trim() || null,
          bankNumber: bankNumber.trim() || null,
          bankHolder: bankHolder.trim() || null,
          opensAt: opensAt || null,
          closesAt: closesAt || null,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(errorMessage(payload, "Periode pendaftaran gagal diperbarui."));
      await onSaved();
      onNotify("success", `Periode ${label.trim()} berhasil diperbarui.`);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Periode pendaftaran gagal diperbarui.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-period-title">
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border border-border bg-white p-5">
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <h3 id="edit-period-title" className="font-heading text-lg font-bold text-primary">Edit Periode Pendaftaran</h3>
            <p className="mt-1 text-xs text-slate-500">{period.unitName} · status {period.isOpen ? "dibuka" : "ditutup"}. Status periode diubah melalui tombol Buka/Tutup.</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} className="text-slate-500" aria-label="Tutup edit periode"><span className="material-symbols-rounded" aria-hidden="true">close</span></button>
        </div>
        {error && <p role="alert" className="mt-4 rounded-sm border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-xs font-semibold text-primary">Tahun Ajaran SPMB<input required value={label} onChange={(event) => setLabel(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-primary">ID Tahun Ajaran SIAKAD (opsional)<input value={sourceAcademicYearId} onChange={(event) => setSourceAcademicYearId(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-primary">Kuota<input required type="number" min="1" step="1" value={quota} onChange={(event) => setQuota(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-primary">Biaya Formulir<input required type="number" min="0" step="1" value={fee} onChange={(event) => setFee(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-primary">Tanggal Buka<input type="date" value={opensAt} onChange={(event) => setOpensAt(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-primary">Tanggal Tutup<input type="date" value={closesAt} onChange={(event) => setClosesAt(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-primary">Nama Bank<input value={bankName} onChange={(event) => setBankName(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-primary">Nomor Rekening<input value={bankNumber} onChange={(event) => setBankNumber(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-primary md:col-span-2">Nama Pemilik Rekening<input value={bankHolder} onChange={(event) => setBankHolder(event.target.value)} className="mt-1.5 w-full rounded-sm border border-border px-3 py-2 text-sm" /></label>
        </div>
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} disabled={submitting} className="rounded-sm border border-border bg-white px-3 py-2 text-xs font-semibold text-primary disabled:opacity-60">Batal</button><button type="submit" disabled={submitting} className="rounded-sm bg-tertiary px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">{submitting ? "Menyimpan..." : "Simpan Perubahan"}</button></div>
      </form>
    </div>
  );
}
