import React from 'react';
import { getMilestones, getPrograms } from '@/actions/strategic';
import MilestonesClient from './client';

export default async function StrategicMilestonesPage() {
  const [milestones, programs] = await Promise.all([
    getMilestones().then(res => res || []).then(res => res || []),
    getPrograms().then(res => res || []).then(res => res || [])
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">Milestones (Tahapan Program)</h1>
        <p className="text-gray-600">Tetapkan fase-fase pencapaian utama untuk tiap program kerja.</p>
      </div>
      <MilestonesClient initialData={milestones} programs={programs} />
    </div>
  );
}
