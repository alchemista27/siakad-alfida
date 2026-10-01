import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExecutionDashboardService } from './execution-dashboard.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('strategic/dashboard')
@UseGuards(JwtAuthGuard)
export class ExecutionDashboardController {
  constructor(private readonly service: ExecutionDashboardService) {}

  @Get('summary')
  getSummary(@Query('academicYearId') academicYearId?: string) {
    return this.service.getSummary(academicYearId);
  }

  @Get('kpi')
  getKpiStats(@Query('departmentId') departmentId?: string) {
    return this.service.getKpiStats(departmentId);
  }

  @Get('progress')
  getProgressPerDepartment(@Query('academicYearId') academicYearId?: string) {
    return this.service.getProgressPerDepartment(academicYearId);
  }
}
