import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";
import {
  ExtracurricularsService,
  type CreateExtracurricularDto,
  type GradeDto,
  type JournalDto,
  type ScheduleDto,
  type UpdateExtracurricularDto,
} from "./extracurriculars.service";

@Controller("extracurriculars")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
export class ExtracurricularsController {
  constructor(private readonly extracurricularsService: ExtracurricularsService) {}

  @Get()
  @SiakadRoles("admin_unit", "guru", "orang_tua")
  list(@CurrentPrincipal() principal: SiakadPrincipal, @Query("studentId") studentId?: string) {
    return this.extracurricularsService.list(principal, studentId);
  }

  @Post()
  @SiakadRoles("admin_unit")
  create(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: CreateExtracurricularDto) {
    return this.extracurricularsService.create(principal, dto);
  }

  @Patch(":id")
  @SiakadRoles("admin_unit")
  update(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Body() dto: UpdateExtracurricularDto) {
    return this.extracurricularsService.update(principal, id, dto);
  }

  @Delete(":id")
  @SiakadRoles("admin_unit")
  remove(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.extracurricularsService.remove(principal, id);
  }

  @Post(":id/coaches")
  @SiakadRoles("admin_unit")
  assignCoach(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Body("coachUserId") coachUserId: string) {
    return this.extracurricularsService.assignCoach(principal, id, coachUserId);
  }

  @Get(":id/schedules")
  @SiakadRoles("guru")
  listSchedules(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.extracurricularsService.listSchedules(principal, id);
  }

  @Post(":id/schedules")
  @SiakadRoles("guru")
  createSchedule(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Body() dto: ScheduleDto) {
    return this.extracurricularsService.createSchedule(principal, id, dto);
  }

  @Patch(":id/schedules/:scheduleId")
  @SiakadRoles("guru")
  updateSchedule(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Param("scheduleId") scheduleId: string, @Body() dto: Partial<ScheduleDto>) {
    return this.extracurricularsService.updateSchedule(principal, id, scheduleId, dto);
  }

  @Delete(":id/schedules/:scheduleId")
  @SiakadRoles("guru")
  removeSchedule(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Param("scheduleId") scheduleId: string) {
    return this.extracurricularsService.removeSchedule(principal, id, scheduleId);
  }

  @Get(":id/journals")
  @SiakadRoles("guru")
  listJournals(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.extracurricularsService.listJournals(principal, id);
  }

  @Post(":id/journals")
  @SiakadRoles("guru")
  createJournal(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Body() dto: JournalDto) {
    return this.extracurricularsService.createJournal(principal, id, dto);
  }

  @Patch(":id/journals/:journalId")
  @SiakadRoles("guru")
  updateJournal(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Param("journalId") journalId: string, @Body() dto: Partial<JournalDto>) {
    return this.extracurricularsService.updateJournal(principal, id, journalId, dto);
  }

  @Delete(":id/journals/:journalId")
  @SiakadRoles("guru")
  removeJournal(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Param("journalId") journalId: string) {
    return this.extracurricularsService.removeJournal(principal, id, journalId);
  }

  @Put(":id/grades")
  @SiakadRoles("guru")
  upsertGrade(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Body() dto: GradeDto) {
    return this.extracurricularsService.upsertGrade(principal, id, dto);
  }

  @Post(":id/enrollments")
  @SiakadRoles("orang_tua")
  join(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Body("studentId") studentId: string) {
    return this.extracurricularsService.join(principal, id, studentId);
  }

  @Delete(":id/enrollments/:studentId")
  @SiakadRoles("orang_tua")
  leave(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string, @Param("studentId") studentId: string) {
    return this.extracurricularsService.leave(principal, id, studentId);
  }
}
