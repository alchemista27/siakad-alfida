"use client";

import { useState, useEffect, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { getUnitStats } from "@/actions/supervisor";

export function SupervisorClient({ units }: { units: { id: string; name: string }[] }) {
  const [selectedUnit, setSelectedUnit] = useState<string>(units[0]?.id || "");
  const [stats, setStats] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (selectedUnit) {
      startTransition(async () => {
        const data = await getUnitStats(selectedUnit);
        setStats(data);
      });
    }
  }, [selectedUnit]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">Pilih Unit Pendidikan:</label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-64 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary"
          >
            <option value="" disabled>-- Pilih Unit --</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-tertiary text-white rounded-md text-sm font-medium hover:bg-tertiary/90 transition-colors"
        >
          <Icon name="picture_as_pdf" className="text-base" />
          <span>Generate Laporan</span>
        </button>
      </div>

      {isPending ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-tertiary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Memuat data monitoring...</p>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Icon name="groups" className="text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Siswa Aktif</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalStudents}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <Icon name="gavel" className="text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Pelanggaran</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalInfractions}</h3>
              </div>
            </div>
            <p className="text-xs text-gray-400">Dalam 30 hari terakhir</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <Icon name="assignment_turned_in" className="text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Rata-rata Karakter</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.avgCharacterScore.toFixed(1)} / 5.0</h3>
              </div>
            </div>
            <p className="text-xs text-gray-400">Dari indikator BPI</p>
          </Card>
          
          {/* Laporan BPI Terbaru */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Icon name="menu_book" className="text-tertiary" />
                Catatan BPI Terbaru
              </h3>
              {stats.recentBpiReports.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentBpiReports.map((report: any) => (
                    <div key={report.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-gray-400 font-bold border border-gray-200">
                        {report.studentName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-800">{report.studentName}</h4>
                        <p className="text-xs text-tertiary font-medium mb-1">{report.className} • {new Date(report.date).toLocaleDateString("id-ID")}</p>
                        <p className="text-sm text-gray-600"><strong>Aktivitas:</strong> {report.activity}</p>
                        {report.notes && <p className="text-sm text-gray-500 mt-1 italic">&quot;{report.notes}&quot;</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Belum ada laporan BPI bulan ini.</p>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-gray-500 text-sm">
          Pilih unit untuk melihat data monitoring
        </div>
      )}
    </div>
  );
}
