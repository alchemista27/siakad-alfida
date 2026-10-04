"use client";

import { useState, useEffect } from "react";
import { getKPIs, createLog, createEvidence } from "@/actions/strategic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";

export default function RealizationPage() {
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Form states per KPI
  const [realizationValues, setRealizationValues] = useState<Record<string, string>>({});
  const [evidenceLinks, setEvidenceLinks] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getKPIs();
      // Filter out KPIs that don't have approved baseline
      setKpis(data);
    } catch (error) {
      alert("Gagal memuat data KPI");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (kpi: any) => {
    const val = realizationValues[kpi.id];
    const link = evidenceLinks[kpi.id];
    const note = notes[kpi.id];

    if (!val || !link) {
      alert("Harap isi nilai capaian dan tautan bukti dokumen wajib");
      return;
    }

    setSubmitting(kpi.id);
    try {
      // 1. Create Evidence first
      const evidence = await createEvidence({
        programId: kpi.programId,
        kpiId: kpi.id,
        name: `Bukti Realisasi - ${kpi.name}`,
        type: "document",
        nature: "mandatory",
        digitalLink: link,
      });

      // 2. Submit Realization Log
      await createLog({
        programId: kpi.programId,
        kpiId: kpi.id,
        evidenceId: evidence.id,
        activityDate: new Date().toISOString(),
        activityName: `Pembaruan Capaian KPI`,
        output: val.toString(), // Service uses output to increment realization
        notes: note,
      });

      alert("Log realisasi berhasil ditambahkan dan capaian KPI diperbarui!");
      
      // Clear form
      setRealizationValues(prev => ({...prev, [kpi.id]: ''}));
      setEvidenceLinks(prev => ({...prev, [kpi.id]: ''}));
      setNotes(prev => ({...prev, [kpi.id]: ''}));
      
      fetchData();
    } catch (error: any) {
      alert(error.message || "Gagal mencatat realisasi. Pastikan Baseline sudah disetujui.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Log Realisasi & Evidences</h1>
          <p className="text-muted-foreground mt-2">
            Catat capaian berkala dari indikator yang telah disetujui baselinenya. Setiap pencatatan wajib menyertakan bukti.
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
            <h3 className="text-lg font-semibold">Tidak Ada Indikator</h3>
            <p className="text-muted-foreground max-w-sm mt-1">Belum ada matriks KPI yang dialokasikan ke departemen Anda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {kpis.map((kpi) => (
            <Card key={kpi.id} className="overflow-hidden border-border/50">
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Icon name="track_changes" className="w-5 h-5 text-tertiary" /> {kpi.name}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Program: {kpi.program?.name} | Satuan: {kpi.unit} | Bobot: {kpi.weight}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Progres Capaian</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {kpi.realization} <span className="text-sm font-normal text-muted-foreground">/ {kpi.target}</span>
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {kpi.baselineStatus !== 'approved' ? (
                  <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-lg">
                    <Icon name="warning" className="text-xl" />
                    <div>
                      <p className="font-semibold">Baseline Belum Disetujui</p>
                      <p className="text-sm opacity-90">Anda tidak dapat mencatat realisasi sebelum Kondisi Awal diverifikasi oleh Atasan.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg border-b pb-2">Catat Capaian Baru</h4>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Angka Penambahan Capaian</label>
                        <div className="relative">
                          <Input 
                            type="number" 
                            placeholder="Contoh: 10"
                            value={realizationValues[kpi.id] ?? ''}
                            onChange={(e) => setRealizationValues({...realizationValues, [kpi.id]: e.target.value})}
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-sm">
                            {kpi.unit}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Angka ini akan diakumulasikan ke total realisasi saat ini.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tautan Bukti Dokumen (Evidence) <span className="text-red-500">*</span></label>
                        <Input 
                          placeholder="https://drive.google.com/..."
                          value={evidenceLinks[kpi.id] ?? ''}
                          onChange={(e) => setEvidenceLinks({...evidenceLinks, [kpi.id]: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Catatan Tambahan (Opsional)</label>
                        <textarea 
                          className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                          placeholder="Tuliskan keterangan mengenai pencapaian ini..."
                          value={notes[kpi.id] ?? ''}
                          onChange={(e) => setNotes({...notes, [kpi.id]: e.target.value})}
                        />
                      </div>

                      <Button 
                        className="w-full gap-2 mt-4" 
                        onClick={() => handleSubmit(kpi)}
                        disabled={submitting === kpi.id}
                      >
                        {submitting === kpi.id ? <Icon name="sync" className="mr-2 animate-spin" /> : <Icon name="upload_file" className="mr-2" />}
                        Simpan Realisasi
                      </Button>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg border-b pb-2 mb-4">Riwayat Log</h4>
                      <div className="space-y-3">
                        {kpi.realizationLogs?.length > 0 ? (
                          kpi.realizationLogs.map((log: any, idx: number) => (
                            <div key={idx} className="flex gap-3 p-3 rounded-lg bg-gray-50 border">
                              <Icon name="check_circle" className="text-green-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">+{log.output} {kpi.unit} <span className="text-muted-foreground font-normal">pada {new Date(log.activityDate).toLocaleDateString()}</span></p>
                                {log.notes && <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-6 border border-dashed rounded-lg text-muted-foreground">
                            <p className="text-sm">Belum ada riwayat realisasi dicatat.</p>
                          </div>
                        )}
                      </div>
                    </div>
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
