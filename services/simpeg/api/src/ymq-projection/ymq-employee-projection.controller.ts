import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { InternalServiceAuthGuard } from "./internal-service-auth.guard";
import { YmqEmployeeProjectionService } from "./ymq-employee-projection.service";
import { parseYmqRosterProjection, YmqRosterProjectionService } from "./ymq-roster-projection.service";

@Controller("internal/ymq")
@UseGuards(InternalServiceAuthGuard)
export class YmqEmployeeProjectionController {
  constructor(
    private readonly employees: YmqEmployeeProjectionService,
    private readonly roster: YmqRosterProjectionService,
  ) {}

  @Post("roster-projections")
  upsertRoster(@Body() body: unknown) {
    return this.roster.upsert(parseYmqRosterProjection(body));
  }
  @Get("employee-projections")
  list(
    @Query("unitId") unitId?: string | string[],
    @Query("updatedAfter") updatedAfter?: string | string[],
  ) {
    return this.employees.list({ unitId, updatedAfter });
  }
}
