import React from 'react';
import { getDepartments, getStrategicUsers } from '@/actions/strategic';
import DepartmentsClient from './client';

export default async function StrategicDepartmentsPage() {
  const [departments, users] = await Promise.all([
    getDepartments().then(res => res || []),
    getStrategicUsers().then(res => res || [])
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">Manajemen Bidang (Department)</h1>
        <p className="text-gray-600">Kelola hierarki organisasi yayasan, biro, dan unit beserta PIC.</p>
      </div>
      <DepartmentsClient initialData={departments} users={users} />
    </div>
  );
}
