import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import {
  SchedulesService,
  type CreateClassScheduleDto,
  type ScheduleListFilter,
  type UpdateClassScheduleDto,
} from "./schedules.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("schedules")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("admin_unit")
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  async list(@CurrentPrincipal() principal: SiakadPrincipal, @Query() filter: ScheduleListFilter) {
    return this.schedulesService.list(principal, filter);
  }

  @Get(":id")
  async getById(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.schedulesService.getById(principal, id);
  }

  @Post()
  async create(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: CreateClassScheduleDto) {
    return this.schedulesService.create(principal, dto);
  }

  @Patch(":id")
  async update(
    @CurrentPrincipal() principal: SiakadPrincipal,
    @Param("id") id: string,
    @Body() dto: UpdateClassScheduleDto,
  ) {
    return this.schedulesService.update(principal, id, dto);
  }

  @Delete(":id")
  async remove(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.schedulesService.remove(principal, id);
  }
}
