import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SIMPEG_UNIT_CATALOG_FETCH, SimpegUnitCatalogClient } from "./simpeg-unit-catalog.client";

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    ServiceJwtAuthGuard,
    SimpegUnitCatalogClient,
    { provide: SIMPEG_UNIT_CATALOG_FETCH, useValue: globalThis.fetch },
  ],
  exports: [AuthService],
})
export class AuthModule {}
