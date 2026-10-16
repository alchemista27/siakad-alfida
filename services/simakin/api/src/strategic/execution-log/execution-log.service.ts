
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StrategicAuthorizationService } from '../workflow/strategic-authorization.service';
import { StrategicAccessQueryService } from '../workflow/strategic-access-query.service';

@Injectable()
export class ExecutionLogService {
  constructor(private prisma: PrismaService, private readonly authorization: StrategicAuthorizationService, private readonly access: StrategicAccessQueryService) {}

  async findAll(user: any) {
    return this.prisma.executionRealizationLog.findMany({
      where: (await this.access.forLogs(user)).where as any,
      include: { program: true, task: true, milestone: true, pic: true },
      orderBy: { activityDate: 'desc' }
    });
  }

  async findOne(id: string, user: any) {
    await this.access.assertCanReadArtifact(user, "log", id);
    return this.prisma.executionRealizationLog.findUnique({
      where: { id },
      include: { program: true, task: true, milestone: true, pic: true }
    });
  }

  async create(data: any, user: any) {
    const program = await this.prisma.workProgram.findUnique({ where: { id: data.programId } });
    if (!program) throw new BadRequestException("Program kerja tidak ditemukan.");
    if (user.roles?.some((role: any) => role.role === "staff" || role.role === "pic_program")) {
      if (!data.taskId) throw new BadRequestException("PIC wajib mengirim progres melalui tugas yang ditetapkan.");
      await this.authorization.assertPicOwnsTask(user, data.taskId);
      const task = await this.prisma.executionTask.findUnique({ where: { id: data.taskId }, select: { programId: true } });
      if (!task || task.programId !== program.id) throw new BadRequestException("Tugas harus berasal dari program kerja yang sama.");
    } else await this.authorization.assertCanReadProgram(user, program.id);
    return this.prisma.$transaction(async (tx) => {
      const { evidenceId, picId, ...logData } = data;
      
      // Check Baseline if kpiId is provided
      if (logData.kpiId) {
        const kpi = await tx.executionKPI.findUnique({ where: { id: logData.kpiId } });
        if (!kpi || kpi.programId !== program.id || kpi.baselineStatus !== 'approved') {
          throw new BadRequestException('KPI harus berasal dari program yang sama dan baseline-nya telah disetujui.');
        }
      }

      const log = await (tx as any).executionRealizationLog.create({ data: { ...logData, picId: user.id, departmentId: program.departmentId, workflowStatus: "draft" } });

      if (evidenceId) {
        const evidence = await (tx as any).executionEvidence.findUnique({ where: { id: evidenceId } });
        if (!evidence || evidence.programId !== program.id || (data.taskId && (evidence.taskId !== data.taskId || evidence.ownerId !== user.id))) throw new BadRequestException("Bukti harus berasal dari tugas/program PIC yang sama.");
        await tx.executionEvidence.update({
          where: { id: evidenceId },
          data: { realizationLogId: log.id, availabilityStatus: 'submitted' }
        });
      }

      // If there's an output value and kpiId, we might want to update the KPI realization
      // Assuming 'output' stores the numeric realization value or there's a separate field.
      // For now, we'll parse output if possible.
      if (logData.kpiId && logData.output && !isNaN(Number(logData.output))) {
        await tx.executionKPI.update({
          where: { id: logData.kpiId },
          data: { realization: { increment: Number(logData.output) } }
        });
      }

      return log;
    });
  }

  async update(id: string, data: any, user: any) {
    await this.access.assertCanReadArtifact(user, "log", id);
    const log = await (this.prisma as any).executionRealizationLog.findUnique({ where: { id } });
    if (!log || log.workflowStatus === "approved_by_bidang") throw new BadRequestException("Log tidak dapat diubah.");
    if (log.picId !== user.id) await this.authorization.assertBiroCanManage(user, log.departmentId);
    const { picId, departmentId, ...safe } = data;
    return (this.prisma as any).executionRealizationLog.update({ where: { id }, data: safe });
  }

  async remove(id: string, user: any) {
    await this.access.assertCanReadArtifact(user, "log", id);
    const log = await (this.prisma as any).executionRealizationLog.findUnique({ where: { id } });
    if (!log || log.workflowStatus !== "draft") throw new BadRequestException("Hanya log draft yang dapat dihapus.");
    if (log.picId !== user.id) await this.authorization.assertBiroCanManage(user, log.departmentId);
    return this.prisma.executionRealizationLog.delete({ where: { id } });
  }
}
