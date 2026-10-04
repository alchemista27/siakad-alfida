"use client";

import { useEffect, useState } from "react";
import { getTrafficLightDashboard } from "@/actions/strategic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

export default function BphDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const result = await getTrafficLightDashboard();
      setData(result);
    } catch (error) {
      alert("Gagal memuat dasbor eksekutif");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Icon name="sync" className="w-10 h-10 animate-spin text-tertiary" />
      </div>
    );
  }

  const { summary, details } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dasbor Eksekutif BPH</h1>
        <p className="text-muted-foreground mt-2">
          Pemantauan _Traffic Light_ atas seluruh Matriks Indikator Kinerja Utama (KPI) Yayasan Alfida.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-surface to-muted/20 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-tertiary/10 rounded-xl">
                <Icon name="monitoring" className="text-2xl text-tertiary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Indikator</p>
                <h3 className="text-3xl font-bold mt-1">{summary.total}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20 overflow-hidden relative group">
          <div className="absolute -right-6 -top-6 text-emerald-500/10 group-hover:scale-110 transition-transform">
            <Icon name="check_circle" className="text-8xl" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-medium text-emerald-700">Sesuai Target (Hijau)</p>
            <div className="flex items-end gap-2 mt-1">
              <h3 className="text-3xl font-bold text-emerald-600">{summary.green}</h3>
              <span className="text-emerald-600/70 mb-1 font-medium">KPI</span>
            </div>
            <p className="text-xs text-emerald-600/70 mt-2">Capaian ≥ 95%</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20 overflow-hidden relative group">
          <div className="absolute -right-6 -top-6 text-amber-500/10 group-hover:scale-110 transition-transform">
            <Icon name="warning" className="text-8xl" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-medium text-amber-700">Peringatan (Kuning)</p>
            <div className="flex items-end gap-2 mt-1">
              <h3 className="text-3xl font-bold text-amber-600">{summary.yellow}</h3>
              <span className="text-amber-600/70 mb-1 font-medium">KPI</span>
            </div>
            <p className="text-xs text-amber-600/70 mt-2">Capaian 75% - 94%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-transparent border-rose-500/20 overflow-hidden relative group">
          <div className="absolute -right-6 -top-6 text-rose-500/10 group-hover:scale-110 transition-transform">
            <Icon name="local_fire_department" className="text-8xl" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-medium text-rose-700">Kritis (Merah)</p>
            <div className="flex items-end gap-2 mt-1">
              <h3 className="text-3xl font-bold text-rose-600">{summary.red}</h3>
              <span className="text-rose-600/70 mb-1 font-medium">KPI</span>
            </div>
            <p className="text-xs text-rose-600/70 mt-2">Capaian &lt; 75%</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Rincian Performa KPI</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {details.map((kpi: any) => {
            const isRed = kpi.color === 'red';
            const isYellow = kpi.color === 'yellow';
            const isGreen = kpi.color === 'green';
            
            return (
              <Card key={kpi.id} className={`border-l-4 transition-all duration-300 hover:shadow-md ${
                isRed ? 'border-l-rose-500 bg-rose-50/30' : 
                isYellow ? 'border-l-amber-500 bg-amber-50/30' : 
                'border-l-emerald-500 bg-emerald-50/30'
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base leading-tight">{kpi.name}</CardTitle>
                    <Badge variant={isRed ? 'red' : isYellow ? 'amber' : 'green'}>
                      {kpi.achievementPercent}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {kpi.program?.department?.name || 'Yayasan'} • {kpi.program?.name}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs uppercase">Target</span>
                      <span className="font-medium">{kpi.target} {kpi.unit}</span>
                    </div>
                    <div className="h-8 w-px bg-border"></div>
                    <div className="flex flex-col text-right">
                      <span className="text-muted-foreground text-xs uppercase">Realisasi</span>
                      <span className={`font-bold ${isRed ? 'text-rose-600' : isYellow ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {kpi.realization} {kpi.unit}
                      </span>
                    </div>
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${
                        isRed ? 'bg-rose-500' : isYellow ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, kpi.achievementPercent)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
