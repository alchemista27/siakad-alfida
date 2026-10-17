import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { TeachingWorkflowService, type RecordGradeDto, type RecordJournalDto } from "./teaching-workflow.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("teaching")
@UseGuards(SiakadAuthGuard)
export class TeachingWorkflowController {
  constructor(private readonly teachingService: TeachingWorkflowService) {}

  @Post("grades")
  async recordGrade(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: RecordGradeDto) {
    return this.teachingService.recordGrade(principal, dto);
  }

  @Post("journals")
  async recordJournal(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: RecordJournalDto) {
    return this.teachingService.recordJournal(principal, dto);
  }
}
