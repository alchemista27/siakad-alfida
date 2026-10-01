import React from 'react';
import { getLogs, getTasks, getStrategicUsers } from '@/actions/strategic';
import LogsClient from './client';

export default async function StrategicLogsPage() {
  const [logs, tasks, users] = await Promise.all([
    getLogs(),
    getTasks(),
    getStrategicUsers()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">Log Realisasi Kegiatan</h1>
        <p className="text-gray-600">Catat pembaruan aktivitas dan jam kerja yang dilakukan per tugas (timesheet operasional).</p>
      </div>
      <LogsClient initialData={logs} tasks={tasks} users={users} />
    </div>
  );
}
