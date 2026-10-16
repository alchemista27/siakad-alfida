import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { ServiceJwtAuthGuard, ServiceRolesGuard } from "@alfida/auth-sdk";
import { InternalOrganizationRolesController, OrganizationRolesController } from "./organization-roles.controller";
import { InternalOrganizationRolesGuard } from "./internal-organization-roles.guard";

@Module({
  controllers: [UsersController, OrganizationRolesController, InternalOrganizationRolesController],
  providers: [UsersService, ServiceJwtAuthGuard, ServiceRolesGuard, InternalOrganizationRolesGuard],
  exports: [UsersService],
})
export class UsersModule {}
