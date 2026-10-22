import { Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { YmqRoles } from "../ymq/ymq-roles.decorator";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";
import { YmqEmployeesService } from "./ymq-employees.service";

@Controller("ymq/employees")
@UseGuards(ServiceJwtAuthGuard, YmqRolesGuard)
export class YmqEmployeesController {
  constructor(private readonly employeesService: YmqEmployeesService) {}

  @Post("sync")
  @YmqRoles("admin_ymq")
  sync(@Query("unitId") unitId?: string, @Query("updatedAfter") updatedAfter?: string) {
    return this.employeesService.sync({ unitId, updatedAfter });
  }

  @Get("assignable")
  @YmqRoles("admin_ymq")
  listAssignable(@Query("unitId") unitId?: string, @Req() _req?: unknown) {
    return this.employeesService.listAssignable(unitId);
  }
}
