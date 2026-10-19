import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { UnitIdentityController } from "./unit-identity.controller";
import { UnitIdentityService } from "./unit-identity.service";

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [UnitIdentityController],
  providers: [UnitIdentityService],
  exports: [UnitIdentityService],
})
export class UnitIdentityModule {}
