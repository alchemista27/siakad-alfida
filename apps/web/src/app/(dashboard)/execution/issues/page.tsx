'use client';

import React, { useState, useEffect } from 'react';

export default function IssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd fetch from API: fetch('/api/strategic/execution-issues')
    setTimeout(() => {
      setIssues([
        { id: '1', title: 'Kurangnya Fasilitas Training', impactScore: 4, probabilityScore: 3, status: 'in_progress', priority: 'high', reporter: { fullName: 'Ahmad' } },
        { id: '2', title: 'Bug di Sistem Kehadiran', impactScore: 5, probabilityScore: 4, status: 'not_started', priority: 'critical', reporter: { fullName: 'Budi' } },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getRiskColor = (impact: number, probability: number) => {
    const score = (impact || 1) * (probability || 1);
    if (score >= 15) return 'bg-red-500/10 text-red-600 border-red-200';
    if (score >= 8) return 'bg-amber-500/10 text-amber-600 border-amber-200';
    return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Risk Register & Issues</h1>
          <p className="text-primary mt-2 font-body text-base">Identifikasi, mitigasi, dan kelola hambatan strategis yayasan.</p>
        </div>
        <button className="px-5 py-3 bg-tertiary text-on-tertiary rounded-sm transition-all font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Lapor Kendala
        </button>
      </div>

      <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-sm font-medium text-gray-400">
                  <th className="pb-4 pl-4">Kendala / Isu</th>
                  <th className="pb-4">Risk Score (I × P)</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Pelapor</th>
                  <th className="pb-4 text-right pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm font-body">
                {issues.map((issue: any) => {
                  const score = (issue.impactScore || 1) * (issue.probabilityScore || 1);
                  return (
                    <tr key={issue.id} className="border-b border-border/30 hover:bg-black/[0.02] transition-colors group">
                      <td className="py-4 pl-4 font-medium text-primary">{issue.title}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getRiskColor(issue.impactScore, issue.probabilityScore)}`}>
                          {score} - {score >= 15 ? 'High' : score >= 8 ? 'Medium' : 'Low'}
                        </span>
                      </td>
                      <td className="py-4 capitalize">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                          {issue.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500">{issue.reporter?.fullName}</td>
                      <td className="py-4 text-right pr-4">
                        <button className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:underline">Detail</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
