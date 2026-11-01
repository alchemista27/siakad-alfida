import { Controller, Get, UseGuards } from "@nestjs/common";
import { InternalServiceAuthGuard } from "../ymq-projection/internal-service-auth.guard";
import { UnitsService } from "./units.service";

@Controller("internal/units")
@UseGuards(InternalServiceAuthGuard)
export class InternalUnitCatalogController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get("active")
  listActive() {
    return this.unitsService.listActiveForInternal();
  }
}
