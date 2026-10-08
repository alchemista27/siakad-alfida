import React from 'react';
import { Icon } from './icon';
import Link from 'next/link';

export function HeatmapKPI({ departments }: { departments: any[] }) {
  // Fungsi hitung skor average kpi per unit
  const calculateScore = (programs: any[]) => {
    if (!programs || programs.length === 0) return null;
    let totalScore = 0;
    let kpiCount = 0;
    programs.forEach(p => {
      if (p.kpis) {
        p.kpis.forEach((kpi: any) => {
          let score = 0;
          if (kpi.direction === "higher_is_better") {
            score = kpi.target > 0 ? (kpi.realization / kpi.target) * 100 : 0;
          } else if (kpi.direction === "lower_is_better") {
            score = kpi.realization <= kpi.target ? 100 : (kpi.target / Math.max(kpi.realization, 1)) * 100;
          } else {
            score = kpi.realization === kpi.target ? 100 : 0;
          }
          totalScore += Math.min(Math.max(score, 0), 100);
          kpiCount++;
        });
      }
    });
    if (kpiCount === 0) return null;
    return totalScore / kpiCount;
  };

  const getColor = (score: number | null) => {
    if (score === null) return "bg-gray-100 border-gray-200 text-gray-400";
    if (score >= 85) return "bg-green-500 border-green-600 text-white hover:bg-green-600";
    if (score >= 60) return "bg-yellow-400 border-yellow-500 text-yellow-900 hover:bg-yellow-500";
    return "bg-red-500 border-red-600 text-white hover:bg-red-600";
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-border shadow-sm mb-6">
      <h3 className="font-heading font-bold text-lg text-primary mb-1">Peta Capaian Kinerja Yayasan</h3>
      <p className="text-xs text-gray-500 mb-4">Warna hijau menunjukkan rata-rata capaian &ge; 85%, kuning 60-84%, merah &lt; 60%.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {departments.map(dept => {
          const score = calculateScore(dept.workPrograms);
          return (
            <Link href={`/pengawas/department/${dept.id}`} key={dept.id}>
              <div className={`p-4 rounded-md border text-center transition-colors ${getColor(score)}`}>
                <div className="font-bold text-sm truncate" title={dept.name}>{dept.name}</div>
                <div className="text-xl font-bold mt-1">{score !== null ? `${score.toFixed(0)}%` : '-'}</div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Sub-departments / Biro Heatmap */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="font-heading font-bold text-sm text-gray-700 mb-3">Unit Pelaksana / Biro</h4>
        <div className="flex flex-wrap gap-2">
          {departments.flatMap(d => d.children || []).map(biro => {
            const score = calculateScore(biro.workPrograms);
            return (
              <div key={biro.id} className={`px-3 py-1.5 rounded text-xs border cursor-help ${getColor(score)}`} title={`Biro ${biro.name} - ${score !== null ? score.toFixed(1) + '%' : 'Belum ada data'}`}>
                {biro.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
