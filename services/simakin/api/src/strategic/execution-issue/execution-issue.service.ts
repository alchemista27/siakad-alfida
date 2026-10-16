import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExecutionIssueDto, UpdateExecutionIssueDto } from '../dto/issue.dto';
import { StrategicAuthorizationService } from '../workflow/strategic-authorization.service';
import { StrategicAccessQueryService } from '../workflow/strategic-access-query.service';

@Injectable()
export class ExecutionIssueService {
  constructor(private readonly prisma: PrismaService, private readonly authorization: StrategicAuthorizationService, private readonly access: StrategicAccessQueryService) {}

  async create(createDto: CreateExecutionIssueDto, user: any) {
    const program = await this.prisma.workProgram.findUnique({ where: { id: createDto.programId } });
    if (!program) throw new NotFoundException("Program kerja tidak ditemukan");
    if (user.roles?.some((role: any) => role.role === "staff" || role.role === "pic_program")) {
      if (!createDto.taskId) throw new NotFoundException("PIC wajib melaporkan kendala melalui tugas yang ditetapkan.");
      await this.authorization.assertPicOwnsTask(user, createDto.taskId);
      const task = await this.prisma.executionTask.findUnique({ where: { id: createDto.taskId }, select: { programId: true } });
      if (!task || task.programId !== program.id) throw new NotFoundException("Tugas harus berasal dari program kerja yang sama.");
    } else await this.authorization.assertCanReadProgram(user, program.id);
    const { reporterId, assigneeId, ...safe } = createDto;
    return (this.prisma as any).executionIssue.create({ data: { ...safe, reporterId: user.id, departmentId: program.departmentId, workflowStatus: "draft" } });
  }

  async findAll(user: any) {
    return this.prisma.executionIssue.findMany({
      where: (await this.access.forIssues(user)).where as any,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, fullName: true } },
        assignee: { select: { id: true, fullName: true } },
      }
    });
  }

  async findOne(id: string, user: any) {
    await this.access.assertCanReadArtifact(user, "issue", id);
    const issue = await this.prisma.executionIssue.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, fullName: true } },
        assignee: { select: { id: true, fullName: true } },
        actionItems: true,
      }
    });
    if (!issue) throw new NotFoundException(`Issue with ID ${id} not found`);
    return issue;
  }

  async update(id: string, updateDto: UpdateExecutionIssueDto, user: any) {
    const issue = await this.findOne(id, user);
    if ((issue as any).workflowStatus === "approved_by_bidang") throw new NotFoundException("Issue yang disetujui tidak dapat diubah");
    if (issue.reporterId !== user.id) await this.authorization.assertBiroCanManage(user, (issue as any).departmentId);
    return this.prisma.executionIssue.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string, user: any) {
    const issue = await this.findOne(id, user);
    if ((issue as any).workflowStatus !== "draft") throw new NotFoundException("Issue revisi tidak boleh dihapus");
    if (issue.reporterId !== user.id) await this.authorization.assertBiroCanManage(user, (issue as any).departmentId);
    return this.prisma.executionIssue.delete({ where: { id } });
  }
}
