
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StrategicAuthorizationService } from '../workflow/strategic-authorization.service';
import { StrategicAccessQueryService } from '../workflow/strategic-access-query.service';

@Injectable()
export class ExecutionMilestoneService {
  constructor(private prisma: PrismaService, private readonly authorization: StrategicAuthorizationService, private readonly access: StrategicAccessQueryService) {}

  async findAll(user: any) {
    return this.prisma.executionMilestone.findMany({
      where: (await this.access.forMilestones(user)).where as any,
      include: { program: true },
      orderBy: { order: 'asc' }
    });
  }

  async findOne(id: string, user: any) {
    await this.access.assertCanReadMilestone(user, id);
    return this.prisma.executionMilestone.findUnique({
      where: { id },
      include: { program: true }
    });
  }

  async create(data: any, user: any) {
    const program = await this.prisma.workProgram.findUnique({ where: { id: data.programId } });
    if (!program) throw new BadRequestException('Program kerja tidak ditemukan.');
    await this.authorization.assertBiroCanManage(user, program.departmentId);
    return this.prisma.executionMilestone.create({ data });
  }

  async update(id: string, data: any, user: any) {
    const milestone = await this.prisma.executionMilestone.findUnique({ where: { id }, include: { program: true } });
    if (!milestone) throw new BadRequestException('Milestone tidak ditemukan.');
    await this.authorization.assertBiroCanManage(user, milestone.program.departmentId);
    const { programId, ...safe } = data;
    if (programId && programId !== milestone.programId) throw new BadRequestException('Milestone tidak dapat dipindahkan ke program lain.');
    return this.prisma.executionMilestone.update({ where: { id }, data: safe });
  }

  async remove(id: string, user: any) {
    const milestone = await this.prisma.executionMilestone.findUnique({ where: { id }, include: { program: true } });
    if (!milestone) throw new BadRequestException('Milestone tidak ditemukan.');
    await this.authorization.assertBiroCanManage(user, milestone.program.departmentId);
    return this.prisma.executionMilestone.delete({ where: { id } });
  }
}
