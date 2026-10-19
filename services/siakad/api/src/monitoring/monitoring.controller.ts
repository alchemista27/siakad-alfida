import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";
import { MonitoringService } from "./monitoring.service";

@Controller("monitoring")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("admin_unit")
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get("academic")
  academic(@CurrentPrincipal() principal: SiakadPrincipal, @Query("academicYearId") academicYearId?: string) {
    return this.monitoringService.academicOverview(principal, academicYearId);
  }
}
