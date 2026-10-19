import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { SubjectsService, type CreateSubjectDto, type UpdateSubjectDto } from "./subjects.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("subjects")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("admin_unit")
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  async list(@CurrentPrincipal() principal: SiakadPrincipal, @Query("unitId") unitId?: string) {
    return this.subjectsService.list(principal, unitId);
  }

  @Get(":id")
  async getById(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.subjectsService.getById(principal, id);
  }

  @Post()
  async create(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(principal, dto);
  }

  @Patch(":id")
  async update(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.update(principal, id, dto);
  }

  @Delete(":id")
  async remove(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.subjectsService.remove(principal, id);
  }
}
