import { Controller, Get, Patch, Param, UseGuards } from "@nestjs/common";
import { LhbsService } from "./lhbs.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("lhbs")
@UseGuards(SiakadAuthGuard)
export class LhbsController {
  constructor(private readonly lhbsService: LhbsService) {}

  @Patch(":id/publish")
  async publish(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.lhbsService.publishLhbs(principal, id);
  }

  @Get(":id/parent")
  async getForParent(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.lhbsService.getReportForParent(principal, id);
  }
}
