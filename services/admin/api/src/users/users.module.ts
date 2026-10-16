import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { OrganizationRoleAdminService } from "./organization-role-admin.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, OrganizationRoleAdminService],
  exports: [UsersService, OrganizationRoleAdminService],
})
export class UsersModule {}
