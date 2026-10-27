import { Module } from "@nestjs/common";
import { GroupStaffModule } from "../group-staff/group-staff.module";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";
import { YmqRoleManagementController } from "./ymq-role-management.controller";
import { YmqRoleManagementService } from "./ymq-role-management.service";

@Module({
  imports: [GroupStaffModule],
  controllers: [YmqRoleManagementController],
  providers: [YmqRoleManagementService, YmqRolesGuard],
})
export class YmqRoleManagementModule {}
