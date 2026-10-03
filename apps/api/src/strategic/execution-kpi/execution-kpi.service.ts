
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
      include: { program: true, pic: true },
    });
  }

  async findByProgram(programId: string) {
    return this.prisma.executionKPI.findMany({
      where: { programId },
      include: { pic: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.executionKPI.findUnique({
      where: { id },
      include: { program: true, pic: true }
    });
  }

  async create(data: CreateExecutionKPIDto) {
    return this.prisma.executionKPI.create({ data: data as any });
  }

  async update(id: string, data: UpdateExecutionKPIDto) {
    return this.prisma.executionKPI.update({ where: { id }, data: data as any });
  }

  async remove(id: string) {
    return this.prisma.executionKPI.delete({ where: { id } });
  }
}
