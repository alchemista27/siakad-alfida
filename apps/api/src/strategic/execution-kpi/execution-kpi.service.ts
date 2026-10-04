
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExecutionKPIDto, UpdateExecutionKPIDto } from '../dto/kpi.dto';

@Injectable()
export class ExecutionKpiService {
  constructor(private prisma: PrismaService) {}

  async findAll(user?: any) {
    let whereClause = {};
    if (user && !user.roles?.some((r: any) => r.role === 'super_admin')) {
      const myDepts = await this.prisma.departmentAdmin.findMany({
        where: { userId: user.id },
        select: { departmentId: true }
      });
      const deptIds = myDepts.map(d => d.departmentId);
      whereClause = { program: { departmentId: { in: deptIds } } };
    }

    return this.prisma.executionKPI.findMany({
      where: whereClause,
      include: { program: true, pic: true, realizationLogs: true, evidences: true },
    });
  }

  async findByProgram(programId: string) {
    return this.prisma.executionKPI.findMany({
      where: { programId },
      include: { pic: true, realizationLogs: true, evidences: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.executionKPI.findUnique({
      where: { id },
      include: { program: true, pic: true, realizationLogs: true, evidences: true }
    });
  }

  async create(data: CreateExecutionKPIDto) {
    return this.prisma.executionKPI.create({ data: data as any });
  }

  async update(id: string, data: UpdateExecutionKPIDto) {
    return this.prisma.executionKPI.update({ where: { id }, data: data as any });
  }

  async submitBaseline(id: string, evidenceId: string) {
    return this.prisma.$transaction(async (tx) => {
      const kpi = await tx.executionKPI.update({
        where: { id },
        data: { baselineStatus: 'submitted' }
      });
      await tx.executionEvidence.update({
        where: { id: evidenceId },
        data: { kpiId: id, availabilityStatus: 'submitted' }
      });
      return kpi;
    });
  }

  async verifyBaseline(id: string, verifierId: string, status: any, notes: string | null = null) {
    return this.prisma.executionKPI.update({
      where: { id },
      data: { baselineStatus: status, notes: notes || undefined }
    });
  }

  async remove(id: string) {
    return this.prisma.executionKPI.delete({ where: { id } });
  }
}
