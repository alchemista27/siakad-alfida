import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExecutionReportService } from './execution-report.service';
import { ServiceJwtAuthGuard } from '@alfida/auth-sdk';
import { SimakinRolesGuard, SimakinRoles } from '../../common/guards';

@Controller('strategic/reports')
@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
@SimakinRoles('admin_bidang', 'pimpinan', 'pengawas')
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
