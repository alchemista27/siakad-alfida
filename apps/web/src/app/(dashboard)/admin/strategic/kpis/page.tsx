import React from 'react';
import { getKPIs, getPrograms, getStrategicUsers } from '@/actions/strategic';
import { requireRole } from '@/lib/auth-guard';
import { UserRole } from '@sim/database';
import KPIsClient from './client';

export default async function StrategicKPIsPage() {
  const [kpis, programs, users] = await Promise.all([
    getKPIs(),
    getPrograms(),
    getStrategicUsers()
  ]);

  const user = await requireRole([UserRole.super_admin, UserRole.admin_bidang, UserRole.pengawas_yayasan]);
  const isPengawas = user.roles.some((r: any) => r.role === UserRole.pengawas_yayasan);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">Manajemen KPI (Key Performance Indicator)</h1>
        <p className="text-gray-600">Tetapkan target, indikator, dan pantau metrik capaian untuk tiap program kerja.</p>
      </div>
      <KPIsClient initialData={kpis} programs={programs} users={users} isPengawas={isPengawas} />
    </div>
  );
}
