import React from 'react';
import { getKPIs, getPrograms, getStrategicUsers } from '@/actions/strategic';
import KPIsClient from './client';

export default async function StrategicKPIsPage() {
  const [kpis, programs, users] = await Promise.all([
    getKPIs(),
    getPrograms(),
    getStrategicUsers()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">Manajemen KPI (Key Performance Indicator)</h1>
        <p className="text-gray-600">Tetapkan target, indikator, dan pantau metrik capaian untuk tiap program kerja.</p>
      </div>
      <KPIsClient initialData={kpis} programs={programs} users={users} />
    </div>
  );
}
