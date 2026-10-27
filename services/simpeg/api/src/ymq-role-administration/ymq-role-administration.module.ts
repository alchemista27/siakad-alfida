import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { AuthYmqRoleBrokerClient, AUTH_YMQ_ROLE_BROKER_FETCH } from "./auth-ymq-role-broker.client";
import { YmqRoleAdministrationController } from "./ymq-role-administration.controller";
import { YmqRoleAdministrationService } from "./ymq-role-administration.service";

@Module({
  imports: [PrismaModule],
  controllers: [YmqRoleAdministrationController],
  providers: [
    YmqRoleAdministrationService,
    AuthYmqRoleBrokerClient,
    { provide: AUTH_YMQ_ROLE_BROKER_FETCH, useValue: fetch },
    SimpegRolesGuard,
  ],
})
export class YmqRoleAdministrationModule {}
