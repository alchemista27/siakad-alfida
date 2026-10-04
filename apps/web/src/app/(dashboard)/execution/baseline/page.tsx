"use client";

import { useState, useEffect } from "react";
import { getKPIs, submitKPIBaseline } from "@/actions/strategic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { createEvidence } from "@/actions/strategic";

export default function BaselinePage() {
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  
  // State for forms
  const [baselineValues, setBaselineValues] = useState<Record<string, number>>({});
  const [evidenceLinks, setEvidenceLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      const data = await getKPIs();
      // Filter KPIs that are draft or submitted to show in this view, 
      // or just show all so users can see approved ones too.
      setKpis(data);
    } catch (error) {
      alert("Gagal memuat data KPI");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (kpiId: string) => {
    const val = baselineValues[kpiId];
    const link = evidenceLinks[kpiId];
    
    if (val === undefined || !link) {
      alert("Harap isi nilai kondisi awal dan tautan bukti dokumen");
      return;
    }

    setSubmitting(kpiId);
    try {
      // 1. Create Evidence record
      const evidence = await createEvidence({
        programId: kpis.find(k => k.id === kpiId)?.programId,
        kpiId,
        name: `Bukti Baseline - ${kpis.find(k => k.id === kpiId)?.name}`,
        type: "document",
        nature: "mandatory",
        digitalLink: link,
      });

      // 2. Submit Baseline
      await submitKPIBaseline(kpiId, evidence.id);
      
      alert("Baseline berhasil diajukan untuk verifikasi Atasan");
      fetchKPIs();
    } catch (error) {
      alert("Gagal mengajukan baseline");
    } finally {
      setSubmitting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge variant="green"><Icon name="check_circle" className="text-xs mr-1"/> Disetujui</Badge>;
      case 'submitted': return <Badge variant="amber"><Icon name="pending" className="text-xs mr-1 animate-spin"/> Menunggu Verifikasi</Badge>;
      case 'rejected': return <Badge variant="red"><Icon name="error" className="text-xs mr-1"/> Ditolak (Revisi)</Badge>;
      default: return <Badge variant="gray"><Icon name="draft" className="text-xs mr-1"/> Draf</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Kondisi Awal (Baseline)</h1>
          <p className="text-muted-foreground mt-2">
            Tetapkan angka pencapaian awal sebelum memulai siklus eksekusi program. Memerlukan persetujuan Atasan.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Icon name="sync" className="w-8 h-8 animate-spin text-tertiary" />
        </div>
      ) : kpis.length === 0 ? (
        <Card className="border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center mb-4">
              <Icon name="error" className="text-tertiary text-2xl" />
            </div>
            <h3 className="text-lg font-semibold">Belum Ada Indikator</h3>
            <p className="text-muted-foreground max-w-sm mt-1">Anda belum ditugaskan pada KPI manapun atau Master Data belum tersedia.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {kpis.map((kpi) => (
            <Card key={kpi.id} className="group overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-4 border-b bg-muted/20">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-lg leading-tight">{kpi.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Program: {kpi.program?.name}
                    </p>
                  </div>
                  {getStatusBadge(kpi.baselineStatus)}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-surface border">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Arah Kinerja</p>
                    <p className="font-medium mt-1">{kpi.direction === 'higher_is_better' ? 'Maksimal (Tinggi Baik)' : 'Minimal (Rendah Baik)'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Target Akhir</p>
                    <p className="font-medium mt-1 text-primary">{kpi.target} {kpi.unit}</p>
                  </div>
                </div>

                {kpi.baselineStatus === 'draft' || kpi.baselineStatus === 'rejected' ? (
                  <div className="space-y-4">
                    {kpi.baselineStatus === 'rejected' && kpi.notes && (
                      <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
                        <strong>Catatan Penolakan:</strong> {kpi.notes}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nilai Kondisi Awal</label>
                        <div className="relative">
                          <Input 
                            type="number" 
                            placeholder="0"
                            value={baselineValues[kpi.id] ?? ''}
                            onChange={(e) => setBaselineValues({...baselineValues, [kpi.id]: parseFloat(e.target.value)})}
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-sm">
                            {kpi.unit}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tautan Bukti Pendukung</label>
                        <Input 
                          placeholder="https://drive.google.com/..."
                          value={evidenceLinks[kpi.id] ?? ''}
                          onChange={(e) => setEvidenceLinks({...evidenceLinks, [kpi.id]: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-2 transition-all" 
                      onClick={() => handleSubmit(kpi.id)}
                      disabled={submitting === kpi.id}
                    >
                      {submitting === kpi.id ? (
                        <Icon name="sync" className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Icon name="cloud_upload" className="w-4 h-4 mr-2" />
                      )}
                      Ajukan Baseline
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div>
                      <p className="text-sm text-muted-foreground">Kondisi Awal Tercatat</p>
                      <p className="text-2xl font-bold text-primary mt-1">{kpi.baseline} <span className="text-base font-normal text-muted-foreground">{kpi.unit}</span></p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(kpi.evidences?.[0]?.digitalLink || "#", "_blank")}>
                      Lihat Bukti <Icon name="arrow_right" className="text-xs" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
