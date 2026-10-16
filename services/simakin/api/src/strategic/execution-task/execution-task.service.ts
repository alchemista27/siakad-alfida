
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StrategicAuthorizationService } from '../workflow/strategic-authorization.service';
import { StrategicAccessQueryService } from '../workflow/strategic-access-query.service';

@Injectable()
export class ExecutionTaskService {
  constructor(private prisma: PrismaService, private readonly authorization: StrategicAuthorizationService, private readonly access: StrategicAccessQueryService) {}

  async findAll(user: any) {
    return this.prisma.executionTask.findMany({
      where: (await this.access.forTasks(user)).where as any,
      include: { milestone: { include: { program: true } }, assignee: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, user: any) {
    await this.access.assertCanReadTask(user, id);
    return this.prisma.executionTask.findUnique({
      where: { id },
      include: { milestone: { include: { program: true } }, assignee: true }
    });
  }

  async findMine(user: any) {
    return this.prisma.executionTask.findMany({ where: { assigneeId: user.id }, include: { program: true, milestone: true, assignee: true }, orderBy: { deadline: "asc" } as any });
  }

  async create(data: any, user: any) {
    const program = await this.prisma.workProgram.findUnique({ where: { id: data.programId } });
    if (!program) throw new BadRequestException("Program kerja tidak ditemukan.");
    await this.authorization.assertBiroCanManage(user, program.departmentId);
    const assignee = data.assigneeId ? await this.prisma.user.findUnique({ where: { id: data.assigneeId } }) : null;
    if (data.assigneeId && !assignee?.isActive) throw new BadRequestException("PIC harus merupakan user proyeksi aktif.");
    if (data.assigneeId) {
      const member = await (this.prisma as any).departmentMember.findFirst({ where: { userId: data.assigneeId, departmentId: program.departmentId } });
      const admin = member ? null : await (this.prisma as any).departmentAdmin?.findFirst({ where: { userId: data.assigneeId, departmentId: program.departmentId } });
      if (!member && !admin) throw new BadRequestException("PIC harus menjadi anggota Biro program kerja.");
    }
    if (data.milestoneId) {
      const milestone = await this.prisma.executionMilestone.findUnique({ where: { id: data.milestoneId }, select: { programId: true } });
      if (!milestone || milestone.programId !== program.id) throw new BadRequestException("Milestone harus berasal dari program kerja yang sama.");
    }
    return this.prisma.executionTask.create({ data: { ...data, assignorId: user.id } });
  }

  async update(id: string, data: any, user: any) {
    const task = await this.prisma.executionTask.findUnique({ where: { id }, include: { program: true } });
    if (!task) throw new BadRequestException("Tugas tidak ditemukan.");
    await this.authorization.assertBiroCanManage(user, task.program.departmentId);
    const { assignorId, ...allowed } = data;
    return this.prisma.executionTask.update({ where: { id }, data: { ...allowed, assignorId: user.id } });
  }

  async remove(id: string, user: any) {
    const task = await this.prisma.executionTask.findUnique({ where: { id }, include: { program: true } });
    if (!task) throw new BadRequestException("Tugas tidak ditemukan.");
    await this.authorization.assertBiroCanManage(user, task.program.departmentId);
    return this.prisma.executionTask.delete({ where: { id } });
  }
}
