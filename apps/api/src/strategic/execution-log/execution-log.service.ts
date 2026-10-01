
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExecutionLogService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.executionRealizationLog.findMany({
      include: { program: true, milestone: true, pic: true },
      orderBy: { activityDate: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.executionRealizationLog.findUnique({
      where: { id },
      include: { program: true, milestone: true, pic: true }
    });
  }

  async create(data: any) {
    return this.prisma.executionRealizationLog.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.executionRealizationLog.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.executionRealizationLog.delete({ where: { id } });
  }
}
