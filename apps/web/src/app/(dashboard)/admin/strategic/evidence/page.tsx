import React from 'react';
import { getEvidences, getTasks, getStrategicUsers } from '@/actions/strategic';
import EvidenceClient from './client';

export default async function StrategicEvidencePage() {
  const [evidences, tasks, users] = await Promise.all([
    getEvidences(),
    getTasks(),
    getStrategicUsers()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">Bukti Kinerja</h1>
        <p className="text-gray-600">Unggah dan verifikasi dokumen/berkas bukti pencapaian kinerja untuk pelaporan.</p>
      </div>
      <EvidenceClient initialData={evidences} tasks={tasks} users={users} />
    </div>
  );
}
