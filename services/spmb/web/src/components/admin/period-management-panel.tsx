"use client";

import { FormEvent, useState } from "react";

export interface AdminPeriodItem {
  id: string;
  unitId?: string;
  sourceAcademicYearId?: string | null;
  unitName: string;
  unitSlug?: string;
  label: string;
  isOpen: boolean;
  quota: number;
  fee?: number;
  opensAt?: string | null;
  closesAt?: string | null;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getApiError(data: unknown, fallback: string) {
  if (data && typeof data === "object" && typeof (data as { message?: unknown }).message === "string") {
    return (data as { message: string }).message;
  }
  return fallback;
}

export function PeriodManagementPanel({
  periods,
  onChanged,
  onNotify,
}: {
  periods: AdminPeriodItem[];
  onChanged: () => Promise<void>;
  onNotify: (type: "success" | "error", message: string) => void;
}) {
  const [unitName, setUnitName] = useState("");
  const [unitSlug, setUnitSlug] = useState("");
  const [label, setLabel] = useState("2026/2027");
  const [sourceAcademicYearId, setSourceAcademicYearId] = useState("");
  const [quota, setQuota] = useState("60");
  const [fee, setFee] = useState("250000");
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<AdminPeriodItem | null>(null);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    const linkedAcademicYearId = sourceAcademicYearId.trim();
    if (linkedAcademicYearId && !UUID_REGEX.test(linkedAcademicYearId)) {
      onNotify("error", "ID Tahun Ajaran SIAKAD harus berupa UUID yang valid atau dikosongkan.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitName: unitName.trim(),
          unitSlug: unitSlug.trim(),
          label: label.trim(),
          sourceAcademicYearId: linkedAcademicYearId || undefined,
          quota: Number(quota || 60),
          fee: Number(fee || 250000),
          opensAt: opensAt || undefined,
          closesAt: closesAt || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(getApiError(data, "Gagal membuat periode pendaftaran."));
      setUnitName("");
      setUnitSlug("");
      await onChanged();
      onNotify("success", "Periode pendaftaran berhasil dibuat.");
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Gagal membuat periode.");
    } finally {
      setBusy(false);
    }
  };

  const toggleOpen = async (period: AdminPeriodItem) => {
    setBusy(true);
    try {
      const endpoint = period.isOpen
        ? `/api/periods/${encodeURIComponent(period.id)}/close`
        : `/api/periods/${encodeURIComponent(period.id)}/open`;
      const res = await fetch(endpoint, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(getApiError(data, "Gagal mengubah status periode."));
      await onChanged();
      onNotify("success", `Periode ${period.label} berhasil ${period.isOpen ? "ditutup" : "dibuka"}.`);
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Gagal mengubah status periode.");
    } finally {
      setBusy(false);
    }
  };

  const deletePeriod = async () => {
    if (!deleteCandidate) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/periods/${encodeURIComponent(deleteCandidate.id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(getApiError(data, "Gagal menghapus periode."));
      const deletedLabel = deleteCandidate.label;
      setDeleteCandidate(null);
      await onChanged();
      onNotify("success", `Periode ${deletedLabel} berhasil dihapus.`);
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Gagal menghapus periode.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-white border border-[#E3E8E7] rounded-lg p-5 space-y-5">
      <div>
        <h2 className="font-heading font-bold text-lg text-[#454545]">Manajemen Periode & Gelombang SPMB</h2>
        <p className="text-xs text-gray-500 mt-1">
          Kelola periode pendaftaran unit, kuota, dan pemetaan tahun ajaran tujuan SIAKAD.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {periods.map((period) => (
          <div key={period.id} className="border border-[#E3E8E7] rounded-md p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-xs text-[#454545]">{period.unitName} · {period.label}</p>
              <p className="text-[11px] text-gray-500 mt-1">
                Kuota: {period.quota} · Status: {period.isOpen ? "Dibuka" : "Ditutup"}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => toggleOpen(period)}
                className="px-3 py-1.5 rounded border border-[#E3E8E7] text-xs font-semibold text-[#0f7f6d] hover:bg-[#e6f4f1] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {period.isOpen ? "Tutup Periode" : "Buka Periode"}
              </button>
              {!period.isOpen && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setDeleteCandidate(period)}
                  className="px-3 py-1.5 rounded border border-[#e7c9c4] text-xs font-semibold text-[#9b3b2e] hover:bg-[#fdf0ee] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Hapus Periode
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {deleteCandidate && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-period-title"
          aria-describedby="delete-period-description"
          className="border border-[#e7c9c4] bg-[#fdf8f7] rounded-lg p-4"
        >
          <h3 id="delete-period-title" className="font-heading text-base font-bold text-[#454545]">
            Hapus periode {deleteCandidate.label}?
          </h3>
          <p id="delete-period-description" className="mt-2 text-xs leading-5 text-[#454545]/75">
            Periode dan pengaturan kosongnya akan dihapus permanen. Periode dengan pendaftar atau jadwal observasi tidak dapat dihapus.
          </p>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setDeleteCandidate(null)}
              className="px-3 py-1.5 rounded border border-[#E3E8E7] text-xs font-semibold text-[#454545] hover:bg-[#F7F8F8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void deletePeriod()}
              className="px-3 py-1.5 rounded bg-[#9b3b2e] text-xs font-semibold text-white hover:bg-[#7d2f25] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hapus Permanen
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleCreate} className="border-t border-[#E3E8E7] pt-4 grid sm:grid-cols-4 gap-3">
        <input
          required
          placeholder="Nama Unit (mis. SDIT)"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
          className="px-3 py-2 border border-[#E3E8E7] rounded text-xs"
        />
        <input
          required
          placeholder="Slug Unit (mis. sdit)"
          value={unitSlug}
          onChange={(e) => setUnitSlug(e.target.value)}
          className="px-3 py-2 border border-[#E3E8E7] rounded text-xs"
        />
        <label className="grid gap-1 text-xs text-[#454545]">
          <span className="font-medium">Tahun Ajaran SPMB</span>
          <input
            required
            placeholder="2026/2027"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="px-3 py-2 border border-[#E3E8E7] rounded text-xs"
          />
        </label>
        <label className="grid gap-1 text-xs text-[#454545]">
          <span className="font-medium">ID Tahun Ajaran SIAKAD (opsional)</span>
          <input
            placeholder="UUID dari SIAKAD"
            value={sourceAcademicYearId}
            onChange={(e) => setSourceAcademicYearId(e.target.value)}
            className="px-3 py-2 border border-[#E3E8E7] rounded text-xs"
          />
          <span className="text-[11px] text-gray-500">
            Hanya untuk pemetaan handoff SIAKAD; bukan label tahun ajaran SPMB.
          </span>
        </label>
        <input
          type="number"
          placeholder="Kuota"
          value={quota}
          onChange={(e) => setQuota(e.target.value)}
          className="px-3 py-2 border border-[#E3E8E7] rounded text-xs"
        />
        <input
          type="number"
          placeholder="Biaya Formulir"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          className="px-3 py-2 border border-[#E3E8E7] rounded text-xs"
        />
        <input
          type="date"
          value={opensAt}
          onChange={(e) => setOpensAt(e.target.value)}
          className="px-3 py-2 border border-[#E3E8E7] rounded text-xs"
        />
        <input
          type="date"
          value={closesAt}
          onChange={(e) => setClosesAt(e.target.value)}
          className="px-3 py-2 border border-[#E3E8E7] rounded text-xs"
        />
        <div className="sm:col-span-4">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 bg-[#0f7f6d] text-white rounded text-xs font-semibold hover:bg-[#0b6355]"
          >
            Tambah Periode Baru
          </button>
        </div>
      </form>
    </section>
  );
}
