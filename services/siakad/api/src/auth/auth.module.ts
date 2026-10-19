import { Module } from "@nestjs/common";
import { SiakadAuthGuard } from "./siakad-auth.guard";
import { SiakadRolesGuard } from "../common/guards/siakad-roles.guard";

@Module({
  providers: [SiakadAuthGuard, SiakadRolesGuard],
  exports: [SiakadAuthGuard, SiakadRolesGuard],
})
export class AuthModule {}
