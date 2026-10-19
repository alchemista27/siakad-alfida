import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { PlacementService, type PlaceStudentDto } from "./placement.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("placement")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("admin_unit")
export class PlacementController {
  constructor(private readonly placementService: PlacementService) {}

  @Get("unplaced")
  async listUnplaced(@CurrentPrincipal() principal: SiakadPrincipal, @Query("unitId") unitId?: string, @Query("academicYearId") academicYearId?: string) {
    return this.placementService.listUnplaced(principal, { unitId, academicYearId });
  }

  @Get("classes/:classId/roster")
  async listRoster(@CurrentPrincipal() principal: SiakadPrincipal, @Param("classId") classId: string) {
    return this.placementService.listRoster(principal, classId);
  }

  @Post()
  async placeStudent(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: PlaceStudentDto) {
    return this.placementService.placeStudent(principal, dto);
  }

  @Post("move")
  async moveStudent(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: PlaceStudentDto) {
    return this.placementService.moveStudent(principal, dto);
  }
}
