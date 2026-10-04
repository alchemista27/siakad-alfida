
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
    return this.prisma.$transaction(async (tx) => {
      const { evidenceId, ...logData } = data;
      
      // Check Baseline if kpiId is provided
      if (logData.kpiId) {
        const kpi = await tx.executionKPI.findUnique({ where: { id: logData.kpiId } });
        if (!kpi || kpi.baselineStatus !== 'approved') {
          throw new Error('Baseline belum disetujui. Tidak dapat mencatat realisasi.');
        }
      }

      const log = await tx.executionRealizationLog.create({ data: logData });

      if (evidenceId) {
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

  async update(id: string, data: any) {
    return this.prisma.executionRealizationLog.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.executionRealizationLog.delete({ where: { id } });
  }
}
