import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";
import { ParentPortalService } from "./parent-portal.service";

@Controller("parent-portal")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("orang_tua")
export class ParentPortalController {
  constructor(private readonly parentPortalService: ParentPortalService) {}

  @Get("overview")
  overview(@CurrentPrincipal() principal: SiakadPrincipal) {
    return this.parentPortalService.overview(principal);
  }
}
