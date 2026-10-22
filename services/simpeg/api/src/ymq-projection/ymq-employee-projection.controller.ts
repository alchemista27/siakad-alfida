import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { InternalServiceAuthGuard } from "./internal-service-auth.guard";
import { YmqEmployeeProjectionService } from "./ymq-employee-projection.service";

@Controller("internal/ymq")
@UseGuards(InternalServiceAuthGuard)
export class YmqEmployeeProjectionController {
  constructor(private readonly employees: YmqEmployeeProjectionService) {}

  @Get("employee-projections")
  list(
    @Query("unitId") unitId?: string | string[],
    @Query("updatedAfter") updatedAfter?: string | string[],
  ) {
    return this.employees.list({ unitId, updatedAfter });
  }
}
