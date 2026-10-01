import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExecutionReportService {
  constructor(private readonly prisma: PrismaService) {}

  async generateManagerialReportData(monthStr?: string, yearStr?: string, departmentId?: string) {
    // In a real app, parse the dates correctly to filter queries
    
    // We will aggregate KPI, Programs, and Issues for the report payload.
    const kpis = await this.prisma.executionKPI.findMany({
      where: departmentId ? { program: { departmentId } } : undefined,
      select: { name: true, target: true, realization: true, unit: true }
    });

    const issues = await this.prisma.executionIssue.findMany({
      where: { status: { not: 'completed' } },
      select: { title: true, status: true, impactScore: true, probabilityScore: true }
    });
    
    const summary = {
      reportType: "Laporan Kinerja Eksekutif",
      period: `${monthStr || 'Sep'} ${yearStr || '2026'}`,
      generatedAt: new Date().toISOString(),
      kpiSummary: kpis,
      issuesReport: issues,
      // Metadata that the PDF renderer uses to layout pages
    };

    return summary;
  }
}
