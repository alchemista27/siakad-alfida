import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AcademicYearsService, type CreateAcademicYearDto, type UpdateAcademicYearDto, type UpdateAcademicYearStatusDto } from "./academic-years.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("academic-years")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("admin_unit")
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Get()
  async list(@CurrentPrincipal() principal: SiakadPrincipal) {
    return this.academicYearsService.list(principal);
  }

  @Get(":id")
  async getById(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.academicYearsService.getById(principal, id);
  }

  @Post()
  async create(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: CreateAcademicYearDto) {
    return this.academicYearsService.create(principal, dto);
  }

  @Patch(":id")
  async update(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Body() dto: UpdateAcademicYearDto) {
    return this.academicYearsService.update(principal, id, dto);
  }

  @Patch(":id/status")
  async updateStatus(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Body() dto: UpdateAcademicYearStatusDto) {
    return this.academicYearsService.updateStatus(principal, id, dto);
  }

  @Delete(":id")
  async remove(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.academicYearsService.remove(principal, id);
  }
}
