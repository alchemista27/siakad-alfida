import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExecutionDashboardService } from './execution-dashboard.service';
import { ServiceJwtAuthGuard } from '@alfida/auth-sdk';
import { SimakinRolesGuard, SimakinRoles } from '../../common/guards';

@Controller('strategic/dashboard')
@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
@SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
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

  @Get('traffic-light')
  getTrafficLightDashboard(@Query('academicYearId') academicYearId?: string) {
    return this.service.getTrafficLightDashboard(academicYearId);
  }

  @Get('rankings')
  getBureauRankings(@Query('academicYearId') academicYearId?: string) {
    return this.service.getBureauRankings(academicYearId);
  }
}
