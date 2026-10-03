'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/ui/icon';

export default function ActionItemsPage() {
  const [tasks] = useState([
    { id: '1', description: 'Revisi modul HR sesuai notulen rapat', deadline: '2026-09-30', status: 'in_progress', source: 'Rapat Evaluasi Program Q3' },
    { id: '2', title: 'Perbaiki bug server memory leak', deadline: '2026-10-02', status: 'not_started', source: 'Issue: Bug di Sistem Kehadiran' },
    { id: '3', title: 'Setup akun AWS baru', deadline: '2026-09-25', status: 'completed', source: 'Issue: Kapasitas Server Penuh' },
  ]);

  const columns = [
    { id: 'not_started', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'completed', title: 'Completed' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary mb-2">Tugas Tindak Lanjut</h1>
          <p className="text-gray-500 font-body text-sm max-w-2xl">Pantau dan selesaikan action items yang ditugaskan kepada Anda secara kanban.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-250px)] min-h-[500px]">
        {columns.map((col) => (
          <div key={col.id} className="flex-1 flex flex-col">
            <h3 className="text-sm font-heading font-bold text-primary mb-4 px-2 uppercase tracking-wide">{col.title}</h3>
            
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-4">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div key={task.id} className="bg-surface p-5 rounded-md border border-border hover:border-gray-300 transition-colors cursor-pointer group">
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="link" className="text-sm" />
                    {task.source}
                  </div>
                  <p className="font-body text-primary font-medium mb-4">{task.description || task.title}</p>
                  
                  <div className="flex items-center justify-between text-xs font-medium border-t border-border pt-4 mt-2">
                    <div className="flex items-center gap-1.5 text-gray-500 bg-neutral px-2 py-1 rounded-md border border-border">
                      <Icon name="event" className="text-sm" />
                      {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </div>
                    
                    {col.id !== 'completed' && (
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-tertiary font-semibold flex items-center gap-1">
                        Geser <Icon name="arrow_forward" className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-gray-400 text-sm font-medium bg-surface/50">
                  Kosong
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
