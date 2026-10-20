import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { AuthModule } from "./auth/auth.module";
import { InternalModule } from "./internal/internal.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SppModule } from "./spp/spp.module";

@Module({
  imports: [PrismaModule, AuthModule, InternalModule, SppModule],
  controllers: [HealthController],
})
export class AppModule {}
