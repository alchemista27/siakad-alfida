import React from 'react';
import { prisma } from '@/lib/prisma';
import { Icon } from '@/components/ui/icon';
import { requireRole } from '@/lib/auth-guard';
import { UserRole } from '@sim/database';

export default async function BphDashboardPage() {
  await requireRole([UserRole.pengawas_yayasan, UserRole.super_admin]);

  // Fetch all WorkPrograms
  const programs = await prisma.workProgram.findMany({
    include: {
      department: true,
    }
  });

  const totalPrograms = programs.length;
  const completedPrograms = programs.filter(p => p.status === 'completed').length;
  
  // Calculate total progress
  let totalProgress = 0;
  if (totalPrograms > 0) {
    const sumProgress = programs.reduce((acc, p) => acc + (p.manualProgress || 0), 0);
    totalProgress = Math.round(sumProgress / totalPrograms);
  }

  // Aggregate by Department
  const deptMap = new Map<string, { id: string, name: string, total: number, completed: number, progressSum: number }>();
  programs.forEach(p => {
    const deptId = p.departmentId;
    if (!deptMap.has(deptId)) {
      deptMap.set(deptId, { id: deptId, name: p.department.name, total: 0, completed: 0, progressSum: 0 });
    }
    const dept = deptMap.get(deptId)!;
    dept.total += 1;
    if (p.status === 'completed') dept.completed += 1;
    dept.progressSum += (p.manualProgress || 0);
  });

  const departments = Array.from(deptMap.values()).map(d => ({
    id: d.id,
    name: d.name,
    total: d.total,
    completed: d.completed,
    progress: d.total > 0 ? Math.round(d.progressSum / d.total) : 0
  })).sort((a, b) => b.progress - a.progress);

  // Fetch top issues
  const rawIssues = await prisma.executionIssue.findMany({
    where: { status: { not: 'completed' } },
  });

  const issues = rawIssues.map(i => {
    const riskScore = (i.impactScore || 1) * (i.probabilityScore || 1);
    const program = programs.find(p => p.id === i.programId);
    return { ...i, riskScore, program };
  }).sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-primary tracking-tight">Dashboard Eksekutif</h1>
          <p className="text-gray-500 mt-2 font-body text-base">Ringkasan pencapaian kinerja dan progres program kerja Yayasan Alfida.</p>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="monitoring" className="text-tertiary" />
            <h3 className="text-gray-500 font-semibold text-xs tracking-wider uppercase font-body">Total Progress Program</h3>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-4">{totalProgress}%</div>
          <div className="w-full bg-neutral rounded-full h-2 mb-2 overflow-hidden border border-border">
            <div className="bg-tertiary h-2 rounded-full" style={{ width: `${totalProgress}%` }}></div>
          </div>
          <p className="text-sm text-gray-500">{completedPrograms} dari {totalPrograms} program selesai</p>
        </div>

        <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="school" className="text-tertiary" />
            <h3 className="text-gray-500 font-semibold text-xs tracking-wider uppercase font-body">Total Program Kerja</h3>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">{totalPrograms}</div>
          <p className="text-sm text-gray-500">Program di seluruh bidang</p>
        </div>

        <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="warning" className="text-red-500" />
            <h3 className="text-gray-500 font-semibold text-xs tracking-wider uppercase font-body">Critical Issues</h3>
          </div>
          <div className="text-4xl font-heading font-bold text-red-600 mb-2">{issues.length}</div>
          <p className="text-sm text-gray-500">Isu belum terselesaikan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Per Departemen */}
        <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
          <h2 className="text-lg font-heading font-bold text-primary mb-6">Progress per Bidang</h2>
          <div className="space-y-6">
            {departments.length === 0 ? (
              <p className="text-gray-500 italic text-sm">Belum ada data program.</p>
            ) : (
              departments.map(dept => (
                <div key={dept.id}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-medium text-gray-700 text-sm">{dept.name}</span>
                    <span className="text-sm font-bold text-tertiary">{dept.progress}%</span>
                  </div>
                  <div className="w-full bg-neutral border border-border rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-secondary h-full rounded-full" 
                      style={{ width: `${dept.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Risk Issues */}
        <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-heading font-bold text-primary">Top Critical Issues</h2>
          </div>
          <div className="space-y-4">
            {issues.length === 0 ? (
              <p className="text-gray-500 italic text-sm">Tidak ada isu kritis aktif.</p>
            ) : (
              issues.map(issue => (
                <div key={issue.id} className="p-4 rounded-sm border border-border bg-neutral/30 flex gap-4 items-start group">
                  <div className="bg-red-50 text-red-600 font-bold w-12 h-12 rounded flex items-center justify-center shrink-0 border border-red-100">
                    {issue.riskScore}
                  </div>
                  <div>
                    <h4 className="font-medium text-primary text-sm">{issue.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 font-body">Bidang: {issue.program?.department?.name || 'Umum'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
