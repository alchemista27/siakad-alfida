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

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitName: unitName.trim(),
          unitSlug: unitSlug.trim(),
          label: label.trim(),
          sourceAcademicYearId: sourceAcademicYearId.trim() || undefined,
          quota: Number(quota || 60),
          fee: Number(fee || 250000),
          opensAt: opensAt || undefined,
          closesAt: closesAt || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Gagal membuat periode pendaftaran.");
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
      if (!res.ok) throw new Error(data.message || "Gagal mengubah status periode.");
      await onChanged();
      onNotify("success", `Periode ${period.label} berhasil ${period.isOpen ? "ditutup" : "dibuka"}.`);
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Gagal mengubah status periode.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-white border border-[#E3E8E7] rounded-lg p-5 space-y-5">
      <div>
        <h2 className="font-heading font-bold text-lg text-[#454545]">Manajemen Periode & Gelombang PPDB</h2>
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
            <button
              type="button"
              disabled={busy}
              onClick={() => toggleOpen(period)}
              className="px-3 py-1.5 rounded border border-[#E3E8E7] text-xs font-semibold text-[#0f7f6d] hover:bg-[#e6f4f1]"
            >
              {period.isOpen ? "Tutup Periode" : "Buka Periode"}
            </button>
          </div>
        ))}
      </div>

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
        <input
          required
          placeholder="Label (2026/2027)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="px-3 py-2 border border-[#E3E8E7] rounded text-xs"
        />
        <input
          placeholder="UUID Tahun Ajaran SIAKAD"
          value={sourceAcademicYearId}
          onChange={(e) => setSourceAcademicYearId(e.target.value)}
          className="px-3 py-2 border border-[#E3E8E7] rounded text-xs"
        />
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
