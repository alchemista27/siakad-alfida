import React from 'react';
import { getTasks, getMilestones, getStrategicUsers } from '@/actions/strategic';
import TasksClient from './client';

export default async function StrategicTasksPage() {
  const [tasks, milestones, users] = await Promise.all([
    getTasks().then(res => res || []).then(res => res || []),
    getMilestones().then(res => res || []).then(res => res || []),
    getStrategicUsers().then(res => res || []).then(res => res || [])
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">Delegasi Tugas (Tasks)</h1>
        <p className="text-gray-600">Bagikan tanggung jawab dan delegasikan pekerjaan kepada staf atau PIC.</p>
      </div>
      <TasksClient initialData={tasks} milestones={milestones} users={users} />
    </div>
  );
}
