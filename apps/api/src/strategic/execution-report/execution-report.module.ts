import { Module } from '@nestjs/common';
import { ExecutionReportService } from './execution-report.service';
import { ExecutionReportController } from './execution-report.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExecutionReportController],
  providers: [ExecutionReportService]
})
export class ExecutionReportModule {}
