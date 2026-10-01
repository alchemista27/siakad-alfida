import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExecutionDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(academicYearId?: string) {
    // Top 5 critical issues
    const topIssues = await this.prisma.executionIssue.findMany({
      take: 5,
      orderBy: [
        { impactScore: 'desc' },
        { probabilityScore: 'desc' },
      ],
      where: {
        status: { not: 'completed' }
      },
      include: {
        reporter: { select: { fullName: true } }
      }
    });

    // Program completion stats
    const totalPrograms = await this.prisma.workProgram.count({
      where: academicYearId ? { academicYearId } : undefined
    });
    
    const completedPrograms = await this.prisma.workProgram.count({
      where: {
        status: 'completed',
        ...(academicYearId && { academicYearId })
      }
    });

    // Overall attendance rate (mock/aggregate from MeetingAttendance)
    // For simplicity, we just calculate the ratio of present vs all records
    const attendanceStats = await this.prisma.meetingAttendance.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    let totalAttendance = 0;
    let presentCount = 0;
    attendanceStats.forEach(stat => {
      totalAttendance += stat._count.status;
      if (stat.status === 'present') presentCount += stat._count.status;
    });
    
    const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

    return {
      topIssues,
      programStats: {
        total: totalPrograms,
        completed: completedPrograms,
        progressPercent: totalPrograms > 0 ? (completedPrograms / totalPrograms) * 100 : 0
      },
      attendanceRate: Math.round(attendanceRate)
    };
  }

  async getKpiStats(departmentId?: string) {
    // Fetch KPIs and aggregate realization vs target
    const kpis = await this.prisma.executionKPI.findMany({
      where: departmentId ? { program: { departmentId } } : undefined,
      select: {
        id: true,
        name: true,
        target: true,
        realization: true,
        unit: true
      }
    });
    
    return kpis.map(kpi => ({
      ...kpi,
      achievementPercent: kpi.target > 0 ? Math.min((kpi.realization / kpi.target) * 100, 100) : 0
    }));
  }

  async getProgressPerDepartment(academicYearId?: string) {
    const departments = await this.prisma.department.findMany({
      include: {
        workPrograms: {
          where: academicYearId ? { academicYearId } : undefined,
          select: { status: true, manualProgress: true }
        }
      }
    });
    
    return departments.map(dept => {
      const total = dept.workPrograms.length;
      const completed = dept.workPrograms.filter(p => p.status === 'completed').length;
      
      let averageProgress = 0;
      if (total > 0) {
        const sumProgress = dept.workPrograms.reduce((acc, p) => acc + (p.manualProgress || 0), 0);
        averageProgress = sumProgress / total;
      }
      
      return {
        departmentId: dept.id,
        departmentName: dept.name,
        totalPrograms: total,
        completedPrograms: completed,
        averageProgress: Math.round(averageProgress)
      };
    });
  }
}
