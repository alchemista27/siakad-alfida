import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ClassroomsService, type CreateClassroomDto, type UpdateClassroomDto } from "./classrooms.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("classrooms")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("admin_unit")
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Get()
  async list(@CurrentPrincipal() principal: SiakadPrincipal, @Query("unitId") unitId?: string, @Query("academicYearId") academicYearId?: string) {
    return this.classroomsService.list(principal, { unitId, academicYearId });
  }

  @Get(":id")
  async getById(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.classroomsService.getById(principal, id);
  }

  @Post()
  async create(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: CreateClassroomDto) {
    return this.classroomsService.create(principal, dto);
  }

  @Patch(":id")
  async update(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Body() dto: UpdateClassroomDto) {
    return this.classroomsService.update(principal, id, dto);
  }

  @Delete(":id")
  async remove(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.classroomsService.remove(principal, id);
  }
}
