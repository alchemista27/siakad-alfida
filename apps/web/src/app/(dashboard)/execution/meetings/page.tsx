'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/ui/icon';

export default function MeetingsPage() {
  const [meetings] = useState([
    { id: '1', title: 'Rapat Evaluasi Program Q3', date: '2026-10-01T09:00:00Z', location: 'Ruang Yayasan', actionItemsCount: 3 },
    { id: '2', title: 'Koordinasi Pengembangan SIAKAD', date: '2026-09-28T14:00:00Z', location: 'Online (Zoom)', actionItemsCount: 5 },
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary mb-2">Rapat & Notulen</h1>
          <p className="text-gray-500 font-body text-sm max-w-2xl">Catat keputusan strategis dan daftar hadir dari setiap pertemuan operasional.</p>
        </div>
        <button className="px-5 py-3 bg-tertiary text-on-tertiary rounded-sm hover:bg-tertiary/90 transition-all font-medium whitespace-nowrap flex items-center gap-2">
          <Icon name="add" className="text-xl" />
          Jadwalkan Rapat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="bg-surface border border-border rounded-lg p-6 hover:border-gray-300 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
              <Icon name="groups" className="text-6xl text-primary" />
            </div>
            
            <div className="relative z-10">
              <div className="text-xs font-semibold text-gray-500 mb-3 tracking-wider uppercase flex items-center gap-1.5">
                <Icon name="event" className="text-sm" />
                {new Date(meeting.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <h3 className="text-xl font-heading font-semibold text-primary mb-5">{meeting.title}</h3>
              
              <div className="space-y-3 mb-6 font-body text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-neutral flex items-center justify-center">
                    <Icon name="schedule" className="text-gray-400 text-lg" />
                  </div>
                  <span>{new Date(meeting.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-neutral flex items-center justify-center">
                    <Icon name="location_on" className="text-gray-400 text-lg" />
                  </div>
                  <span>{meeting.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-border">
                <span className="text-xs font-semibold text-gray-600 bg-neutral px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 border border-border">
                  <Icon name="checklist" className="text-sm" />
                  {meeting.actionItemsCount} Tindak Lanjut
                </span>
                <button className="text-sm font-semibold text-tertiary hover:opacity-80 transition-opacity inline-flex items-center gap-1">
                  Buka Notulen <Icon name="arrow_forward" className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
