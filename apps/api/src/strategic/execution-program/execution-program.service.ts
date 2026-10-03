
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExecutionProgramDto, UpdateExecutionProgramDto } from '../dto/program.dto';

@Injectable()
export class ExecutionProgramService {
  constructor(private prisma: PrismaService) {}

  async findAll(user?: any) {
    let whereClause = {};
    if (user && !user.roles?.some((r: any) => r.role === 'super_admin')) {
      const myDepts = await this.prisma.departmentAdmin.findMany({
        where: { userId: user.id },
        select: { departmentId: true }
      });
      const deptIds = myDepts.map(d => d.departmentId);
      whereClause = { departmentId: { in: deptIds } };
    }

    return this.prisma.workProgram.findMany({
      where: whereClause,
      include: { department: true, user: true, coordinator: true, kpis: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.workProgram.findUnique({
      where: { id },
      include: { department: true, user: true, coordinator: true, kpis: true }
    });
  }

  async create(data: CreateExecutionProgramDto) {
    return this.prisma.workProgram.create({ data: data as any });
  }

  async update(id: string, data: UpdateExecutionProgramDto) {
    return this.prisma.workProgram.update({ where: { id }, data: data as any });
  }

  async remove(id: string) {
    return this.prisma.workProgram.delete({ where: { id } });
  }
}
