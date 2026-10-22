import { Body, Controller, Get, Param, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { YmqRoles } from "../ymq/ymq-roles.decorator";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";
import { LearningSessionQueryDto, UpsertLearningSessionDto } from "./sessions.dto";
import { SessionsService } from "./sessions.service";

@Controller("learning-sessions")
@UseGuards(ServiceJwtAuthGuard, YmqRolesGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Put(":groupId/:sessionDate")
  @YmqRoles("admin_ymq", "pembina_ymq", "admin_kelompok")
  upsert(
    @Param("groupId") groupId: string,
    @Param("sessionDate") sessionDate: string,
    @Body() dto: UpsertLearningSessionDto,
    @Req() req: any,
  ) {
    return this.sessionsService.upsert(groupId, sessionDate, dto, req.user);
  }

  @Get()
  @YmqRoles("admin_ymq", "pembina_ymq", "admin_kelompok", "pengawas", "pimpinan", "peserta")
  list(@Query() query: LearningSessionQueryDto, @Req() req: any) {
    return this.sessionsService.list(query, req.user);
  }

  @Get(":id")
  @YmqRoles("admin_ymq", "pembina_ymq", "admin_kelompok", "pengawas", "pimpinan", "peserta")
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.sessionsService.findOne(id, req.user);
  }
}
