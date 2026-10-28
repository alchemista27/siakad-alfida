import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { InternalServiceAuthGuard, parseUnitId } from "../ymq-projection/internal-service-auth.guard";
import { UnitsService } from "./units.service";

@Controller("internal/units")
@UseGuards(InternalServiceAuthGuard)
export class InternalUnitLetterheadController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get(":unitId/letterhead")
  getLetterhead(@Param("unitId") unitId: string) {
    return this.unitsService.getLetterheadForInternal(parseUnitId(unitId)!);
  }
}
