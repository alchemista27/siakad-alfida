import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";

export default async function DepartmentReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const deptId = resolvedParams.id;

  const department = await prisma.department.findUnique({
    where: { id: deptId },
    include: {
      leader: true,
    }
  });

  if (!department) return notFound();

  const programs = await prisma.workProgram.findMany({
    where: { departmentId: deptId },
    include: {
      kpis: {
        include: {
          pic: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const getStatusColor = (capaian: number) => {
    if (capaian >= 85) return "bg-green-100 text-green-700 border-green-200";
    if (capaian >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getStatusText = (capaian: number) => {
    if (capaian >= 85) return "Baik (Hijau)";
    if (capaian >= 60) return "Waspada (Kuning)";
    return "Kritis (Merah)";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-primary">Matriks KPI: Bidang {department.name}</h1>
          <p className="text-base font-body text-gray-500 mt-2">
            Laporan sasaran strategis, indikator, dan capaian program kerja.
          </p>
        </div>
        <a 
          href={`http://187.127.113.61:3001/strategic/kpis/export/excel?departmentId=${deptId}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="download" />
          <span>Download Laporan Excel</span>
        </a>
      </div>

      {programs.length === 0 ? (
        <div className="bg-surface border border-border p-8 rounded-md text-center">
          <Icon name="folder_off" className="text-5xl text-gray-300 mb-3" />
          <p className="text-gray-500 italic">Belum ada program kerja terdaftar di bidang ini.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {programs.map((prog, index) => (
            <div key={prog.id} className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
              <div className="bg-neutral/50 border-b border-border p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-white border border-border rounded w-8 h-8 flex items-center justify-center font-bold text-tertiary shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-bold text-primary">{prog.title}</h2>
                    {prog.description && (
                      <p className="text-sm text-gray-600 mt-1">{prog.description}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-5 bg-white">
                {prog.kpis.length === 0 ? (
                  <p className="text-gray-400 italic text-sm py-4">Belum ada indikator KPI yang ditetapkan untuk program ini.</p>
                ) : (
                  <div className="space-y-6">
                    {prog.kpis.map((kpi, kIndex) => {
                      let capaian = 0;
                      if (kpi.direction === "higher_is_better") {
                        capaian = kpi.target > 0 ? (kpi.realization / kpi.target) * 100 : 0;
                      } else if (kpi.direction === "lower_is_better") {
                        capaian = kpi.realization <= kpi.target ? 100 : (kpi.target / Math.max(kpi.realization, 1)) * 100;
                      } else {
                        capaian = kpi.realization === kpi.target ? 100 : 0;
                      }
                      capaian = Math.min(Math.max(capaian, 0), 100);

                      return (
                        <div key={kpi.id} className="border border-border rounded-md bg-neutral/10 overflow-hidden">
                          {/* KPI Header */}
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border-b border-border bg-white">
                            <div>
                              <div className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-1">Indikator {kIndex + 1}</div>
                              <h3 className="text-base font-bold text-primary">{kpi.name}</h3>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <div className="text-xs text-gray-500 mb-0.5">Capaian</div>
                                <div className="text-xl font-bold font-heading text-primary">{capaian.toFixed(1)}%</div>
                              </div>
                              <div className={`px-3 py-1.5 rounded text-xs font-bold border ${getStatusColor(capaian)}`}>
                                {getStatusText(capaian)}
                              </div>
                            </div>
                          </div>
                          
                          {/* KPI Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-border bg-white text-sm">
                            <div className="p-3">
                              <div className="text-xs text-gray-500 mb-1">Baseline</div>
                              <div className="font-semibold text-primary">{kpi.baseline} <span className="text-gray-400 font-normal">{kpi.unit}</span></div>
                            </div>
                            <div className="p-3">
                              <div className="text-xs text-gray-500 mb-1">Target</div>
                              <div className="font-semibold text-primary">{kpi.target} <span className="text-gray-400 font-normal">{kpi.unit}</span></div>
                            </div>
                            <div className="p-3">
                              <div className="text-xs text-gray-500 mb-1">Realisasi</div>
                              <div className="font-semibold text-tertiary">{kpi.realization} <span className="text-gray-400 font-normal">{kpi.unit}</span></div>
                            </div>
                            <div className="p-3">
                              <div className="text-xs text-gray-500 mb-1">Bobot KPI</div>
                              <div className="font-semibold text-primary">{kpi.weight}%</div>
                            </div>
                            <div className="p-3">
                              <div className="text-xs text-gray-500 mb-1">Update</div>
                              <div className="font-semibold text-primary capitalize">{kpi.updateFrequency.replace('_', ' ')}</div>
                            </div>
                            <div className="p-3">
                              <div className="text-xs text-gray-500 mb-1">PIC</div>
                              <div className="font-semibold text-primary truncate" title={kpi.pic?.fullName || "-"}>{kpi.pic?.fullName || "-"}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
