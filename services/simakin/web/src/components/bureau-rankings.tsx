"use client";

import React from "react";

export interface BureauRankItem {
  departmentId: string;
  departmentName: string;
  parentName?: string | null;
  isSubDepartment?: boolean;
  totalPrograms: number;
  totalKpis: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  greenRate: number;
  averageProgress: number;
}

interface BureauRankingsProps {
  rankings: BureauRankItem[];
}

export function BureauRankings({ rankings }: BureauRankingsProps) {
  if (rankings.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-xl border border-border">
        Belum ada data biro atau departemen untuk ditampilkan dalam klasemen.
      </div>
    );
  }

  const getMedalBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs font-mono shadow-2xs">
            🥇 1
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-800 border border-gray-300 font-bold text-xs font-mono shadow-2xs">
            🥈 2
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-900 border border-orange-300 font-bold text-xs font-mono shadow-2xs">
            🥉 3
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 text-gray-500 font-semibold text-xs font-mono">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-bold font-heading text-primary flex items-center gap-2">
            <span className="material-symbols-rounded text-tertiary text-[20px]">
              leaderboard
            </span>
            <span>Klasemen Ranking Biro (Capaian KPI Hijau Terbanyak)</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Peringkat diurutkan berdasarkan perolehan jumlah indikator KPI berstatus Hijau (&ge; 95%) terbanyak.
          </p>
        </div>

        <div className="text-xs text-gray-500 font-semibold self-start sm:self-auto">
          {rankings.length} Bidang & Biro Terdaftar
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F7F8F8] border-b border-border text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4 text-center w-16">Peringkat</th>
              <th className="py-3 px-4">Nama Biro / Bidang</th>
              <th className="py-3 px-4 text-center">KPI Hijau</th>
              <th className="py-3 px-4 text-center">Kuning</th>
              <th className="py-3 px-4 text-center">Merah</th>
              <th className="py-3 px-4 text-center">Total KPI</th>
              <th className="py-3 px-4">Rasio Capaian Target</th>
              <th className="py-3 px-4 text-right">Rata-rata Skor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rankings.map((bureau, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;

              return (
                <tr
                  key={bureau.departmentId}
                  className={`hover:bg-gray-50/70 transition-colors ${
                    isTopThree ? "bg-[#fdfdfb]" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 text-center">
                    {getMedalBadge(rank)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-primary">
                      {bureau.departmentName}
                    </div>
                    {bureau.parentName && (
                      <div className="text-[11px] text-gray-400">
                        Induk: {bureau.parentName}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {bureau.greenCount} Hijau
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-amber-700">
                    {bureau.yellowCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-rose-700">
                    {bureau.redCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-gray-700">
                    {bureau.totalKpis}
                  </td>
                  <td className="py-3.5 px-4 min-w-[140px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-gray-500">
                        <span>{bureau.greenRate}% Sukses</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${bureau.greenRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono font-bold text-sm text-tertiary">
                      {bureau.averageProgress}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
