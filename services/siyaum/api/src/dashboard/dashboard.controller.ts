import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { DashboardService } from "./dashboard.service";
import { YmqDashboardQueryDto } from "./dashboard.dto";
import { YmqRoles } from "../ymq/ymq-roles.decorator";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";

@Controller("dashboard")
@UseGuards(ServiceJwtAuthGuard, YmqRolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("metrics")
  @YmqRoles("admin_ymq", "pembina_ymq", "admin_kelompok", "pengawas", "pimpinan")
  getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get("ymq/general")
  @YmqRoles("admin_ymq", "pembina_ymq", "admin_kelompok", "pengawas", "pimpinan")
  general(@Query() query: YmqDashboardQueryDto, @Req() req: any) {
    return this.dashboardService.general(query, req.user);
  }

  @Get("ymq/executive/overview")
  @YmqRoles("admin_ymq", "pengawas", "pimpinan")
  executiveOverview(@Query() query: YmqDashboardQueryDto, @Req() req: any) {
    return this.dashboardService.executiveOverview(query, req.user);
  }

  @Get("ymq/executive/groups")
  @YmqRoles("admin_ymq", "pengawas", "pimpinan")
  executiveGroups(@Query() query: YmqDashboardQueryDto, @Req() req: any) {
    return this.dashboardService.executiveGroups(query, req.user);
  }

  @Get("ymq/executive/rankings")
  @YmqRoles("admin_ymq", "pengawas", "pimpinan")
  executiveRankings(@Query() query: YmqDashboardQueryDto, @Req() req: any) {
    return this.dashboardService.executiveRankings(query, req.user);
  }
}
