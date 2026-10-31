import { Module } from "@nestjs/common";
import { SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { AssignmentsController } from "./assignments.controller";
import { AssignmentsService } from "./assignments.service";
import { EmployeesModule } from "../employees/employees.module";

@Module({
  imports: [EmployeesModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, SimpegRolesGuard],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
