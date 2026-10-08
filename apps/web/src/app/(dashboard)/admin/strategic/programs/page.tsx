import React from 'react';
import { getPrograms, getDepartments, getStrategicUsers } from '@/actions/strategic';
import ProgramsClient from './client';

export default async function StrategicProgramsPage() {
  const [programs, departments, users] = await Promise.all([
    getPrograms().then(res => res || []).then(res => res || []),
    getDepartments().then(res => res || []).then(res => res || []),
    getStrategicUsers().then(res => res || []).then(res => res || [])
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">Manajemen Program Kerja</h1>
        <p className="text-gray-600">Pantau dan kelola program kerja strategis per bidang (RKT/RKJM).</p>
      </div>
      <ProgramsClient initialData={programs} departments={departments} users={users} />
    </div>
  );
}
