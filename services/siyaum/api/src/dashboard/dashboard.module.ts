import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";

@Module({
  controllers: [DashboardController],
  providers: [YmqRolesGuard, DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
