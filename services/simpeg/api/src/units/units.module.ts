import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { OrganizationSyncModule } from "../organization-sync/organization-sync.module";
import { SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { UnitsController } from "./units.controller";
import { UnitsService } from "./units.service";

@Module({
  imports: [PrismaModule, OrganizationSyncModule],
  controllers: [UnitsController],
  providers: [UnitsService, SimpegRolesGuard],
})
export class UnitsModule {}
