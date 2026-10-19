import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { PromotionService, type PromotionDecisionDto } from "./promotion.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("promotion")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("wali_kelas")
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get("classes/:classId/roster")
  roster(@CurrentPrincipal() principal: SiakadPrincipal, @Param("classId") classId: string) {
    return this.promotionService.listRoster(principal, classId);
  }

  @Post("decisions")
  decide(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: PromotionDecisionDto) {
    return this.promotionService.decide(principal, dto);
  }
}
