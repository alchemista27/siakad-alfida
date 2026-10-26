import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { OrganizationSyncController } from "./organization-sync.controller";
import { AuthOrganizationRoleClient } from "./auth-organization-role.client";
import { OrganizationSyncProcessor } from "./organization-sync.processor";
import { OrganizationSyncService } from "./organization-sync.service";
import { SimakinSyncClient } from "./simakin-sync.client";
import { SiakadSyncClient } from "./siakad-sync.client";

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationSyncController],
  providers: [OrganizationSyncService, OrganizationSyncProcessor, SimakinSyncClient, SiakadSyncClient, AuthOrganizationRoleClient, SimpegRolesGuard],
  exports: [OrganizationSyncService, AuthOrganizationRoleClient],
})
export class OrganizationSyncModule {}
