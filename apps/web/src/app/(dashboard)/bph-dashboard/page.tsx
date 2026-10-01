'use client';

import React, { useState, useEffect } from 'react';

export default function BphDashboardPage() {
  const [data, setData] = useState({
    summary: { total: 45, completed: 21, progressPercent: 46, attendanceRate: 88 },
    departments: [
      { id: 1, name: 'Akademik', total: 12, completed: 8, progress: 66 },
      { id: 2, name: 'HRD', total: 8, completed: 3, progress: 37 },
      { id: 3, name: 'Bina Pribadi Islam', total: 15, completed: 9, progress: 60 },
      { id: 4, name: 'Sarpras', total: 10, completed: 1, progress: 10 },
    ],
    topIssues: [
      { id: 1, title: 'Keterlambatan Proyek Gedung A', riskScore: 25, status: 'in_progress', reporter: 'Budi (Sarpras)' },
      { id: 2, title: 'Server SIAKAD Overload', riskScore: 20, status: 'not_started', reporter: 'IT Dept' },
      { id: 3, title: 'Kekurangan Tenaga Pengajar Tahsin', riskScore: 16, status: 'in_progress', reporter: 'Ahmad (BPI)' },
    ]
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary tracking-tight">Dashboard BPH Yayasan</h1>
          <p className="text-gray-500 mt-2 font-body text-lg">Ringkasan eksekutif performa dan kesehatan strategis Alfida.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Tahun Ajaran:</span>
          <select className="bg-white border border-gray-200 rounded-xl px-4 py-2 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/20">
            <option>2026/2027</option>
            <option>2025/2026</option>
          </select>
        </div>
      </div>

      {/* Top Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-secondary/90 to-tertiary rounded-3xl p-6 text-white shadow-lg shadow-secondary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </div>
          <h3 className="text-secondary-100 font-medium mb-1">Total Progress Program</h3>
          <div className="text-5xl font-heading font-bold mb-4">{data.summary.progressPercent}%</div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div className="bg-white h-2 rounded-full" style={{ width: `${data.summary.progressPercent}%` }}></div>
          </div>
          <p className="text-sm text-white/80">{data.summary.completed} dari {data.summary.total} program selesai</p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
          <h3 className="text-gray-500 font-medium mb-1">Rata-rata Kehadiran Rapat</h3>
          <div className="text-5xl font-heading font-bold text-primary mb-4">{data.summary.attendanceRate}%</div>
          <div className="flex items-center text-sm font-medium text-emerald-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            +2.4% dari bulan lalu
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
          <h3 className="text-gray-500 font-medium mb-1">Critical Issues (Risiko Tinggi)</h3>
          <div className="text-5xl font-heading font-bold text-red-500 mb-4">{data.topIssues.length}</div>
          <div className="flex items-center text-sm font-medium text-red-500">
            Segera butuh tindak lanjut BPH
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Per Departemen */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-heading font-semibold text-primary mb-6">Progress per Bidang</h2>
          <div className="space-y-6">
            {data.departments.map(dept => (
              <div key={dept.id}>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-medium text-gray-700">{dept.name}</span>
                  <span className="text-sm font-bold text-secondary">{dept.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-secondary to-tertiary h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${dept.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Risk Issues */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-heading font-semibold text-primary">Top Critical Issues</h2>
            <button className="text-sm text-secondary font-medium hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-4">
            {data.topIssues.map(issue => (
              <div key={issue.id} className="p-4 rounded-2xl border border-red-100 bg-red-50/30 flex gap-4 items-start group hover:bg-red-50/80 transition-colors cursor-pointer">
                <div className="bg-red-100 text-red-600 font-bold w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                  {issue.riskScore}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-red-700 transition-colors">{issue.title}</h4>
                  <p className="text-sm text-gray-500 mt-1 font-body">Dilaporkan oleh: {issue.reporter}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
