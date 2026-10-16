import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { DepartmentsController } from "./departments.controller";
import { DepartmentsService } from "./departments.service";
import { OrganizationSyncModule } from "../organization-sync/organization-sync.module";

@Module({
  imports: [PrismaModule, OrganizationSyncModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService, SimpegRolesGuard],
})
export class DepartmentsModule {}
