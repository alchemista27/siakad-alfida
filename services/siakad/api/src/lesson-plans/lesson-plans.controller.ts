import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";
import {
  LessonPlansService,
  type CreateLessonPlanDto,
  type UpdateLessonPlanDto,
} from "./lesson-plans.service";

@Controller("lesson-plans")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("guru")
export class LessonPlansController {
  constructor(private readonly lessonPlansService: LessonPlansService) {}

  @Get()
  list(@CurrentPrincipal() principal: SiakadPrincipal) {
    return this.lessonPlansService.list(principal);
  }

  @Get(":id")
  findOne(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.lessonPlansService.findOne(principal, id);
  }

  @Post()
  create(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: CreateLessonPlanDto) {
    return this.lessonPlansService.create(principal, dto);
  }

  @Patch(":id")
  update(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Body() dto: UpdateLessonPlanDto) {
    return this.lessonPlansService.update(principal, id, dto);
  }

  @Delete(":id")
  remove(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.lessonPlansService.remove(principal, id);
  }
}
