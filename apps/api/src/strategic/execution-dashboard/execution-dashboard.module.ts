import { Module } from '@nestjs/common';
import { ExecutionDashboardService } from './execution-dashboard.service';
import { ExecutionDashboardController } from './execution-dashboard.controller';
import { ExecutionDashboardCron } from './execution-dashboard.cron';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExecutionDashboardController],
  providers: [ExecutionDashboardService, ExecutionDashboardCron]
})
export class ExecutionDashboardModule {}
