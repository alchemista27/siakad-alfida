import { Module } from "@nestjs/common";
import { SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { AssignmentsController } from "./assignments.controller";
import { AssignmentsService } from "./assignments.service";
import { EmployeesModule } from "../employees/employees.module";
import { OrganizationSyncModule } from "../organization-sync/organization-sync.module";

@Module({
  imports: [EmployeesModule, OrganizationSyncModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, SimpegRolesGuard],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
