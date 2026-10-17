import { Module } from "@nestjs/common";
import { SiakadAuthGuard } from "./siakad-auth.guard";

@Module({
  providers: [SiakadAuthGuard],
  exports: [SiakadAuthGuard],
})
export class AuthModule {}
