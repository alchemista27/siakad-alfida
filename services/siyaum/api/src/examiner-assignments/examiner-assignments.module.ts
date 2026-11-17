import { Module } from "@nestjs/common";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";
import { ExaminerAssignmentsController } from "./examiner-assignments.controller";
import { ExaminerAssignmentsService } from "./examiner-assignments.service";

@Module({
  controllers: [ExaminerAssignmentsController],
  providers: [ExaminerAssignmentsService, YmqRolesGuard],
})
export class ExaminerAssignmentsModule {}
