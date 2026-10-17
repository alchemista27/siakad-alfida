import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ClassroomsService, type CreateClassroomDto } from "./classrooms.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("classrooms")
@UseGuards(SiakadAuthGuard)
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Get()
  async list(
    @CurrentPrincipal() principal: SiakadPrincipal,
    @Query("unitId") unitId?: string,
    @Query("academicYearId") academicYearId?: string,
  ) {
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
}
