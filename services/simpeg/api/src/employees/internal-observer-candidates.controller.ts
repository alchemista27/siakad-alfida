import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { InternalServiceAuthGuard } from "../ymq-projection/internal-service-auth.guard";
import { EmployeesService } from "./employees.service";

@Controller("internal/employees")
@UseGuards(InternalServiceAuthGuard)
export class InternalObserverCandidatesController {
  constructor(private readonly employees: EmployeesService) {}

  @Get("observer-candidates")
  list(@Query("unitId") unitId = "", @Query("search") search = "") {
    return this.employees.observerCandidates(unitId, search);
  }

  @Get(":userId/observer-eligibility")
  async eligibility(@Param("userId") userId: string, @Query("unitId") unitId = "") {
    return { eligible: await this.employees.isCurrentUnitEmployee(unitId, userId) };
  }
}