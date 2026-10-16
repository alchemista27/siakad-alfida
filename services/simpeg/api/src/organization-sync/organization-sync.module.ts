import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { OrganizationSyncController } from "./organization-sync.controller";
import { OrganizationSyncProcessor } from "./organization-sync.processor";
import { OrganizationSyncService } from "./organization-sync.service";
import { SimakinSyncClient } from "./simakin-sync.client";

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationSyncController],
  providers: [OrganizationSyncService, OrganizationSyncProcessor, SimakinSyncClient, SimpegRolesGuard],
  exports: [OrganizationSyncService],
})
export class OrganizationSyncModule {}
