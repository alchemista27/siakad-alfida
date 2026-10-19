import { Module } from "@nestjs/common";
import { SiskeuAuthGuard } from "./siskeu-auth.guard";
import { SiskeuRolesGuard } from "./siskeu-roles.guard";

@Module({
  providers: [SiskeuAuthGuard, SiskeuRolesGuard],
  exports: [SiskeuAuthGuard, SiskeuRolesGuard],
})
export class AuthModule {}
