import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";
import { UnitIdentityService, type UpdateUnitIdentityDto } from "./unit-identity.service";

@Controller("unit-identity")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
export class UnitIdentityController {
  constructor(private readonly unitIdentityService: UnitIdentityService) {}

  @Get("me")
  @SiakadRoles("admin_unit")
  getMe(@CurrentPrincipal() principal: SiakadPrincipal) {
    return this.unitIdentityService.getMe(principal);
  }

  @Patch("me")
  @SiakadRoles("admin_unit")
  updateMe(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: UpdateUnitIdentityDto) {
    return this.unitIdentityService.updateMe(principal, dto);
  }

  @Get(":unitId")
  @SiakadRoles("super_admin")
  getByUnitId(@CurrentPrincipal() principal: SiakadPrincipal, @Param("unitId") unitId: string) {
    return this.unitIdentityService.getByUnitId(principal, unitId);
  }

  @Patch(":unitId")
  @SiakadRoles("super_admin")
  updateByUnitId(
    @CurrentPrincipal() principal: SiakadPrincipal,
    @Param("unitId") unitId: string,
    @Body() dto: UpdateUnitIdentityDto,
  ) {
    return this.unitIdentityService.updateByUnitId(principal, unitId, dto);
  }
}
