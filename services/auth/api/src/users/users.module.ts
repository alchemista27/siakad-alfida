import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { ServiceJwtAuthGuard, ServiceRolesGuard } from "@alfida/auth-sdk";
import { InternalOrganizationRolesController, OrganizationRolesController } from "./organization-roles.controller";
import { InternalOrganizationRolesGuard } from "./internal-organization-roles.guard";
import { InternalStaffCandidatesController } from "./internal-staff-candidates.controller";

@Module({
  controllers: [UsersController, OrganizationRolesController, InternalOrganizationRolesController, InternalStaffCandidatesController],
  providers: [UsersService, ServiceJwtAuthGuard, ServiceRolesGuard, InternalOrganizationRolesGuard],
  exports: [UsersService],
})
export class UsersModule {}
