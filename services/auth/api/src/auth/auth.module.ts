import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";

@Module({
  controllers: [AuthController],
  providers: [AuthService, ServiceJwtAuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
