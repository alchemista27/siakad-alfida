import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { IwrLevel } from "../generated/prisma";
import { YmqRoles } from "../ymq/ymq-roles.decorator";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";
import { CurriculumService } from "./curriculum.service";
import { CreateIwrCurriculumDto, UpdateIwrCurriculumDto } from "./curriculum.dto";

@Controller("curriculum/iwr")
@UseGuards(ServiceJwtAuthGuard, YmqRolesGuard)
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get()
  @YmqRoles("admin_ymq", "pembina_ymq", "admin_kelompok")
  list(@Query("level") level?: IwrLevel) {
    return this.curriculumService.list(level);
  }

  @Post()
  @YmqRoles("admin_ymq")
  create(@Body() dto: CreateIwrCurriculumDto) {
    return this.curriculumService.create(dto);
  }

  @Patch(":id")
  @YmqRoles("admin_ymq")
  update(@Param("id") id: string, @Body() dto: UpdateIwrCurriculumDto) {
    return this.curriculumService.update(id, dto);
  }

  @Patch(":id/archive")
  @YmqRoles("admin_ymq")
  archive(@Param("id") id: string) {
    return this.curriculumService.archive(id);
  }
}
