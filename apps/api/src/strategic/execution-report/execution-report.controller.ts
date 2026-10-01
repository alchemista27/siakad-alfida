import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExecutionReportService } from './execution-report.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('strategic/reports')
@UseGuards(JwtAuthGuard)
export class ExecutionReportController {
  constructor(private readonly service: ExecutionReportService) {}

  @Get('managerial')
  getManagerialReport(
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('departmentId') departmentId?: string
  ) {
    return this.service.generateManagerialReportData(month, year, departmentId);
  }
}
