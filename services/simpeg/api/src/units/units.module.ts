import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { OrganizationSyncModule } from "../organization-sync/organization-sync.module";
import { SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { InternalServiceAuthGuard } from "../ymq-projection/internal-service-auth.guard";
import { InternalUnitLetterheadController } from "./internal-unit-letterhead.controller";
import { UnitsController } from "./units.controller";
import { UnitsService } from "./units.service";

@Module({
  imports: [PrismaModule, OrganizationSyncModule],
  controllers: [UnitsController, InternalUnitLetterheadController],
  providers: [UnitsService, SimpegRolesGuard, InternalServiceAuthGuard],
})
export class UnitsModule {}
