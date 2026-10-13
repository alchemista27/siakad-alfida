import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExecutionDashboardCron {
  private readonly logger = new Logger(ExecutionDashboardCron.name);

  constructor(private readonly prisma: PrismaService) {}

  // Run at midnight on the last day of every month to compute historical snapshots if needed
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyCalculation() {
    this.logger.debug('Running monthly dashboard aggregation...');
    
    // In a real application, you might save snapshots of KPI achievements, 
    // health scores, and department progress to a `DashboardSnapshot` table here.
    // For now, we will just log that the job ran successfully.
    
    const departments = await this.prisma.department.findMany({
      select: { id: true, name: true }
    });
    
    this.logger.log(`Aggregated stats for ${departments.length} departments.`);
  }
}
