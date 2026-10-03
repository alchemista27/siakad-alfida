'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';

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
    if (score >= 15) return 'bg-red-50 text-red-600 border-red-200';
    if (score >= 8) return 'bg-amber-50 text-amber-600 border-amber-200';
    return 'bg-green-50 text-tertiary border-green-200';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary mb-2">Risk Register & Issues</h1>
          <p className="text-gray-500 font-body text-sm max-w-2xl">Identifikasi, mitigasi, dan kelola hambatan strategis yayasan secara dini.</p>
        </div>
        <button className="px-5 py-3 bg-tertiary text-on-tertiary rounded-sm hover:bg-tertiary/90 transition-all font-medium flex items-center gap-2 whitespace-nowrap">
          <Icon name="add" className="text-xl" />
          Lapor Kendala
        </button>
      </div>

      <div className="bg-surface border border-border rounded-md p-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tertiary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider font-semibold text-gray-500">
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
                    <tr key={issue.id} className="border-b border-border/50 hover:bg-neutral transition-colors group">
                      <td className="py-4 pl-4 font-semibold text-primary">{issue.title}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${getRiskColor(issue.impactScore, issue.probabilityScore)}`}>
                          {score} - {score >= 15 ? 'High' : score >= 8 ? 'Medium' : 'Low'}
                        </span>
                      </td>
                      <td className="py-4 capitalize">
                        <span className="px-2.5 py-1 bg-neutral text-gray-600 rounded-md text-xs font-medium border border-border inline-flex items-center gap-1.5">
                          <Icon name={issue.status === 'in_progress' ? 'cached' : 'hourglass_empty'} className="text-sm" />
                          {issue.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500">{issue.reporter?.fullName}</td>
                      <td className="py-4 text-right pr-4">
                        <button className="text-tertiary opacity-0 group-hover:opacity-100 transition-opacity font-semibold hover:underline flex items-center justify-end gap-1 ml-auto">
                          Detail <Icon name="arrow_forward" className="text-sm" />
                        </button>
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
