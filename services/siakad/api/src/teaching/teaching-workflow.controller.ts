import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import {
  TeachingWorkflowService,
  type GradeBatchDto,
  type JournalDto,
  type RecordGradeDto,
  type RecordJournalDto,
} from "./teaching-workflow.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("teaching")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("guru")
export class TeachingWorkflowController {
  constructor(private readonly teachingService: TeachingWorkflowService) {}

  @Get("assignments/:assignmentId/grades")
  listGrades(@CurrentPrincipal() principal: SiakadPrincipal, @Param("assignmentId") assignmentId: string) {
    return this.teachingService.listGrades(principal, assignmentId);
  }

  @Put("assignments/:assignmentId/grades/batch")
  batchGrades(@CurrentPrincipal() principal: SiakadPrincipal, @Param("assignmentId") assignmentId: string, @Body() dto: GradeBatchDto) {
    return this.teachingService.batchGrades(principal, assignmentId, dto);
  }

  @Post("grades")
  recordGrade(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: RecordGradeDto) {
    return this.teachingService.recordGrade(principal, dto);
  }

  @Get("assignments/:assignmentId/journals")
  listJournals(@CurrentPrincipal() principal: SiakadPrincipal, @Param("assignmentId") assignmentId: string) {
    return this.teachingService.listJournals(principal, assignmentId);
  }

  @Post("assignments/:assignmentId/journals")
  createJournal(@CurrentPrincipal() principal: SiakadPrincipal, @Param("assignmentId") assignmentId: string, @Body() dto: JournalDto) {
    return this.teachingService.createJournal(principal, assignmentId, dto);
  }

  @Patch("journals/:journalId")
  updateJournal(@CurrentPrincipal() principal: SiakadPrincipal, @Param("journalId") journalId: string, @Body() dto: Partial<JournalDto>) {
    return this.teachingService.updateJournal(principal, journalId, dto);
  }

  @Delete("journals/:journalId")
  removeJournal(@CurrentPrincipal() principal: SiakadPrincipal, @Param("journalId") journalId: string) {
    return this.teachingService.removeJournal(principal, journalId);
  }

  @Post("journals")
  recordJournal(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: RecordJournalDto) {
    return this.teachingService.recordJournal(principal, dto);
  }
}
