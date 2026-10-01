'use client';

import React, { useState } from 'react';

export default function MeetingsPage() {
  const [meetings] = useState([
    { id: '1', title: 'Rapat Evaluasi Program Q3', date: '2026-10-01T09:00:00Z', location: 'Ruang Yayasan', actionItemsCount: 3 },
    { id: '2', title: 'Koordinasi Pengembangan SIAKAD', date: '2026-09-28T14:00:00Z', location: 'Online (Zoom)', actionItemsCount: 5 },
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Rapat & Notulen</h1>
          <p className="text-primary mt-2 font-body text-base">Catat keputusan strategis dan daftar hadir dari setiap pertemuan.</p>
        </div>
        <button className="px-5 py-3 bg-tertiary text-on-tertiary rounded-sm transition-all font-medium whitespace-nowrap">
          + Jadwalkan Rapat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="bg-surface border border-border rounded-md p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-16 h-16 text-secondary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
            </div>
            
            <div className="relative z-10">
              <div className="text-xs font-semibold text-secondary mb-2 tracking-wider uppercase">
                {new Date(meeting.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <h3 className="text-xl font-heading font-semibold text-primary mb-4">{meeting.title}</h3>
              
              <div className="space-y-3 mb-6 font-body text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {new Date(meeting.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {meeting.location}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                  {meeting.actionItemsCount} Action Items
                </span>
                <button className="text-sm font-medium text-secondary hover:text-tertiary transition-colors">Buka Notulen &rarr;</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
