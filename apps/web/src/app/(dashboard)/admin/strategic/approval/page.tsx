"use client";

import { useState, useEffect } from "react";
import { getKPIs, verifyKPIBaseline } from "@/actions/strategic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

export default function ApprovalPage() {
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getKPIs();
      // Filter KPIs that need baseline approval
      const submittedKpis = data.filter((k: any) => k.baselineStatus === 'submitted');
      setKpis(submittedKpis);
    } catch (error) {
      alert("Gagal memuat data persetujuan");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (kpiId: string, status: 'approved' | 'rejected') => {
    setProcessing(kpiId);
    try {
      await verifyKPIBaseline(kpiId, status, notes[kpiId]);
      alert(status === 'approved' ? "Baseline disetujui" : "Baseline dikembalikan untuk direvisi");
      fetchData();
    } catch (error) {
      alert("Gagal memproses verifikasi");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Verifikasi Atasan (Chain of Command)</h1>
        <p className="text-muted-foreground mt-2">
          Pusat validasi untuk pengajuan target Baseline dan log realisasi capaian dari anggota bidang Anda.
        </p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Icon name="sync" className="w-8 h-8 animate-spin text-tertiary" />
        </div>
      ) : kpis.length === 0 ? (
        <Card className="border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Icon name="check_circle" className="text-5xl text-emerald-500/50 mb-4" />
            <h3 className="text-lg font-semibold">Semua Bersih!</h3>
            <p className="text-muted-foreground max-w-sm mt-1">Tidak ada pengajuan yang memerlukan verifikasi Anda saat ini.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2 flex items-center gap-2">
            <Icon name="warning" className="w-5 h-5 text-amber-500" />
            Menunggu Verifikasi Kondisi Awal (Baseline)
            <Badge variant="gray" className="ml-2 rounded-full">{kpis.length}</Badge>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {kpis.map((kpi) => (
              <Card key={kpi.id} className="overflow-hidden border-border/50 shadow-sm">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg leading-tight">{kpi.name}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Diajukan oleh: <span className="font-medium text-foreground">{kpi.pic?.fullName || 'Belum di-assign'}</span>
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 divide-x divide-y border-b">
                    <div className="p-4 flex flex-col justify-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Target Tahunan</p>
                      <p className="font-bold text-lg mt-1">{kpi.target} <span className="text-sm font-normal text-muted-foreground">{kpi.unit}</span></p>
                    </div>
                    <div className="p-4 flex flex-col justify-center bg-primary/5">
                      <p className="text-xs text-primary uppercase tracking-wider font-semibold">Angka Baseline Awal</p>
                      <p className="font-bold text-2xl text-primary mt-1">{kpi.baseline} <span className="text-sm font-normal text-primary/70">{kpi.unit}</span></p>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    {kpi.evidences && kpi.evidences.length > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-2">
                          <Icon name="description" className="w-4 h-4 text-tertiary" />
                          <span className="text-sm font-medium">Dokumen Bukti Baseline</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => window.open(kpi.evidences[0].digitalLink || "#", "_blank")}>
                          Buka / Unduh
                        </Button>
                      </div>
                    )}
                    
                    <div className="space-y-2 pt-2">
                      <label className="text-sm font-medium">Catatan Verifikasi (opsional, wajib jika ditolak)</label>
                      <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm resize-none"
                        placeholder="Tuliskan alasan penolakan atau catatan tambahan..."
                        value={notes[kpi.id] ?? ''}
                        onChange={(e) => setNotes({...notes, [kpi.id]: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 pt-2">
                      <Button 
                        variant="primary" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700" 
                        onClick={() => handleVerify(kpi.id, 'approved')}
                        disabled={processing === kpi.id}
                      >
                        {processing === kpi.id ? <Icon name="sync" className="mr-2 animate-spin" /> : <Icon name="check_circle" className="mr-2" />}
                        Setujui Baseline
                      </Button>
                      <Button 
                        variant="danger" 
                        className="w-full" 
                        onClick={() => handleVerify(kpi.id, 'rejected')}
                        disabled={processing === kpi.id}
                      >
                        {processing === kpi.id ? <Icon name="sync" className="mr-2 animate-spin" /> : <Icon name="cancel" className="mr-2" />}
                        Tolak & Revisi
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
