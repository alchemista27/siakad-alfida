import { Body, Controller, Get, Param, Patch, Post, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { LhbsService, type CompileLhbsDto } from "./lhbs.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("lhbs")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
export class LhbsController {
  constructor(private readonly lhbsService: LhbsService) {}

  @Post("compile")
  @SiakadRoles("wali_kelas")
  compile(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: CompileLhbsDto) {
    return this.lhbsService.compileDraft(principal, dto);
  }

  @Patch(":id/publish")
  @SiakadRoles("wali_kelas")
  publish(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.lhbsService.publishLhbs(principal, id);
  }

  @Get(":id/parent")
  @SiakadRoles("orang_tua")
  getForParent(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.lhbsService.getReportForParent(principal, id);
  }

  @Get(":id/pdf")
  @SiakadRoles("orang_tua")
  async pdfForParent(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Res() response: Response) {
    const pdf = await this.lhbsService.getPdfForParent(principal, id);
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `attachment; filename="lhbs-${id}.pdf"`);
    response.setHeader("Cache-Control", "private, no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.send(pdf);
  }
}
