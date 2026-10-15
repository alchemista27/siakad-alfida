"use client";

import React, { useState } from "react";

export interface KpiHeatmapItem {
  id: string;
  name: string;
  target: number;
  realization: number;
  unit: string;
  achievementPercent: number;
  color: "green" | "yellow" | "red";
  program?: {
    id: string;
    title: string;
    department?: {
      id: string;
      name: string;
    };
  };
}

interface KpiHeatmapProps {
  kpis: KpiHeatmapItem[];
}

export function KpiHeatmap({ kpis }: KpiHeatmapProps) {
  const [selectedKpi, setSelectedKpi] = useState<KpiHeatmapItem | null>(null);

  if (kpis.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-xl border border-border">
        Belum ada data indikator KPI untuk matriks heatmap.
      </div>
    );
  }

  // Kelompokkan KPI berdasarkan departemen/biro
  const groupedByDept = kpis.reduce((acc, kpi) => {
    const deptName = kpi.program?.department?.name || "Lainnya / Umum";
    if (!acc[deptName]) {
      acc[deptName] = [];
    }
    acc[deptName].push(kpi);
    return acc;
  }, {} as Record<string, KpiHeatmapItem[]>);

  const getColorClasses = (color: "green" | "yellow" | "red") => {
    switch (color) {
      case "green":
        return "bg-emerald-500 hover:bg-emerald-600 text-white";
      case "yellow":
        return "bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold";
      case "red":
        return "bg-rose-500 hover:bg-rose-600 text-white";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-bold font-heading text-primary flex items-center gap-2">
            <span className="material-symbols-rounded text-tertiary text-[20px]">
              grid_view
            </span>
            <span>Heatmap Matriks Sebaran Kinerja KPI</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Peta visual sebaran performa seluruh indikator per biro. Klik sel KPI untuk melihat rincian angka target dan realisasi.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-600 self-start sm:self-auto">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span>&ge; 95%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
            <span>75% - 94%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
            <span>&lt; 75%</span>
          </span>
        </div>
      </div>

      {/* Grid Matriks Biro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedByDept).map(([deptName, deptKpis]) => {
          const avgScore = Math.round(
            deptKpis.reduce((acc, k) => acc + k.achievementPercent, 0) / deptKpis.length
          );
          const greenCount = deptKpis.filter((k) => k.color === "green").length;

          return (
            <div
              key={deptName}
              className="border border-border/80 rounded-xl p-4 bg-[#fafbfb] hover:border-gray-300 transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-bold text-xs text-primary font-heading line-clamp-1" title={deptName}>
                    {deptName}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex-shrink-0 ${
                      avgScore >= 80
                        ? "bg-emerald-100 text-emerald-800"
                        : avgScore >= 60
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {avgScore}%
                  </span>
                </div>
                <div className="text-[11px] text-gray-400">
                  {deptKpis.length} KPI &bull; {greenCount} On-Track
                </div>
              </div>

              {/* Matriks Kotak KPI */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {deptKpis.map((kpi) => {
                  const isSelected = selectedKpi?.id === kpi.id;

                  return (
                    <button
                      key={kpi.id}
                      type="button"
                      onClick={() => setSelectedKpi(kpi)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold transition-transform cursor-pointer shadow-2xs hover:scale-110 focus:outline-none ${getColorClasses(
                        kpi.color
                      )} ${isSelected ? "ring-2 ring-primary ring-offset-1 scale-105" : ""}`}
                      title={`${kpi.name} (${kpi.achievementPercent}%)`}
                    >
                      {kpi.achievementPercent > 99 ? "99+" : kpi.achievementPercent}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pop-up Card Detail KPI Terpilih */}
      {selectedKpi && (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  selectedKpi.color === "green"
                    ? "bg-emerald-100 text-emerald-800"
                    : selectedKpi.color === "yellow"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {selectedKpi.color === "green"
                  ? "Sesuai Target"
                  : selectedKpi.color === "yellow"
                  ? "Peringatan"
                  : "Kritis"}
              </span>
              <span className="text-gray-400">&bull;</span>
              <span className="text-gray-500 font-semibold">{selectedKpi.program?.department?.name || "-"}</span>
            </div>
            <h4 className="font-bold text-sm text-primary">{selectedKpi.name}</h4>
            <p className="text-[11px] text-gray-500">
              Program: <strong>{selectedKpi.program?.title || "-"}</strong>
            </p>
          </div>

          <div className="flex items-center gap-6 bg-white px-5 py-3 rounded-xl border border-border shadow-2xs">
            <div className="text-center">
              <div className="text-[10px] uppercase font-semibold text-gray-400">Target</div>
              <div className="font-mono font-bold text-primary">
                {selectedKpi.target} {selectedKpi.unit}
              </div>
            </div>
            <div className="text-center border-l border-border pl-6">
              <div className="text-[10px] uppercase font-semibold text-gray-400">Realisasi</div>
              <div className="font-mono font-bold text-primary">
                {selectedKpi.realization} {selectedKpi.unit}
              </div>
            </div>
            <div className="text-center border-l border-border pl-6">
              <div className="text-[10px] uppercase font-semibold text-gray-400">Capaian</div>
              <div
                className={`font-mono font-bold text-base ${
                  selectedKpi.color === "green"
                    ? "text-emerald-600"
                    : selectedKpi.color === "yellow"
                    ? "text-amber-600"
                    : "text-rose-600"
                }`}
              >
                {selectedKpi.achievementPercent}%
              </div>
            </div>
            <button
              onClick={() => setSelectedKpi(null)}
              className="ml-2 text-gray-400 hover:text-gray-600 p-1"
              title="Tutup rincian"
            >
              <span className="material-symbols-rounded text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
