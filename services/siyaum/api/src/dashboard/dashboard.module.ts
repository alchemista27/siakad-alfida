import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { SIMPEG_UNIT_CATALOG_FETCH, SimpegUnitCatalogClient } from "./simpeg-unit-catalog.client";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";

@Module({
  controllers: [DashboardController],
  providers: [
    YmqRolesGuard,
    DashboardService,
    SimpegUnitCatalogClient,
    { provide: SIMPEG_UNIT_CATALOG_FETCH, useValue: fetch },
  ],
  exports: [DashboardService],
})
export class DashboardModule {}
