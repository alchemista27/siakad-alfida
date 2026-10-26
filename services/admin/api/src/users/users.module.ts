import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import {
  OrganizationRoleAdminService,
  ORGANIZATION_ROLE_FETCH,
} from "./organization-role-admin.service";
import { PrismaModule } from "../prisma/prisma.module";
import {
  StaffApprovalProjectionClient,
  STAFF_APPROVAL_PROJECTION_FETCH,
} from "./staff-approval-projection.client";

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    StaffApprovalProjectionClient,
    { provide: STAFF_APPROVAL_PROJECTION_FETCH, useValue: fetch },
    OrganizationRoleAdminService,
    { provide: ORGANIZATION_ROLE_FETCH, useValue: fetch },
  ],
  exports: [UsersService, OrganizationRoleAdminService],
})
export class UsersModule {}
