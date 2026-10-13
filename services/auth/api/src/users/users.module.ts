import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { ServiceJwtAuthGuard, ServiceRolesGuard } from "@alfida/auth-sdk";

@Module({
  controllers: [UsersController],
  providers: [UsersService, ServiceJwtAuthGuard, ServiceRolesGuard],
  exports: [UsersService],
})
export class UsersModule {}
