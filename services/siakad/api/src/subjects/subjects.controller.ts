import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common";
import { SubjectsService, type CreateSubjectDto } from "./subjects.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("subjects")
@UseGuards(SiakadAuthGuard)
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
}
