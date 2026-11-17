import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { YmqRoles } from "../ymq/ymq-roles.decorator";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";
import { CreateExaminerAssignmentDto } from "./examiner-assignments.dto";
import { ExaminerAssignmentsService } from "./examiner-assignments.service";

@Controller("examiner-assignments")
@UseGuards(ServiceJwtAuthGuard, YmqRolesGuard)
@YmqRoles("admin_ymq")
export class ExaminerAssignmentsController {
  constructor(private readonly examinerAssignmentsService: ExaminerAssignmentsService) {}

  @Get()
  list(@Query("academicYear") academicYear: string | undefined, @Req() req: any) {
    return this.examinerAssignmentsService.list(academicYear, req.user);
  }

  @Post()
  assign(@Body() dto: CreateExaminerAssignmentDto, @Req() req: any) {
    return this.examinerAssignmentsService.assign(dto, req.user);
  }

  @Delete(":id")
  revoke(@Param("id") id: string, @Req() req: any) {
    return this.examinerAssignmentsService.revoke(id, req.user);
  }
}
