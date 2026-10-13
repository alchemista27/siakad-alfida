import { Controller, Get, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";

@Controller("dashboard")
@UseGuards(ServiceJwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("metrics")
  async getMetrics() {
    return this.dashboardService.getMetrics();
  }
}
