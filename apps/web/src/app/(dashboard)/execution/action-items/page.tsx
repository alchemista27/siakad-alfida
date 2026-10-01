'use client';

import React, { useState } from 'react';

export default function ActionItemsPage() {
  const [tasks] = useState([
    { id: '1', description: 'Revisi modul HR sesuai notulen rapat', deadline: '2026-09-30', status: 'in_progress', source: 'Rapat Evaluasi Program Q3' },
    { id: '2', title: 'Perbaiki bug server memory leak', deadline: '2026-10-02', status: 'not_started', source: 'Issue: Bug di Sistem Kehadiran' },
    { id: '3', title: 'Setup akun AWS baru', deadline: '2026-09-25', status: 'completed', source: 'Issue: Kapasitas Server Penuh' },
  ]);

  const columns = [
    { id: 'not_started', title: 'To Do', color: 'bg-neutral border-border' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-neutral border-border' },
    { id: 'completed', title: 'Completed', color: 'bg-neutral border-border' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Tugas Tindak Lanjut</h1>
          <p className="text-primary mt-2 font-body text-base">Pantau dan selesaikan action items yang ditugaskan kepada Anda.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-250px)] min-h-[500px]">
        {columns.map((col) => (
          <div key={col.id} className={`flex-1 rounded-3xl border p-4 flex flex-col ${col.color}`}>
            <h3 className="text-lg font-heading font-semibold text-gray-700 mb-4 px-2">{col.title}</h3>
            
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-4">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div key={task.id} className="bg-surface p-5 rounded-md shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group">
                  <div className="text-xs font-medium text-secondary mb-2 uppercase tracking-wide">
                    {task.source}
                  </div>
                  <p className="font-body text-gray-800 mb-4">{task.description || task.title}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </div>
                    
                    {col.id !== 'completed' && (
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-secondary hover:text-tertiary">
                        Move &rarr;
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 text-sm font-medium">
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
