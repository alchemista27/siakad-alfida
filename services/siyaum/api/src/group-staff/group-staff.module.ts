import { Module } from "@nestjs/common";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";
import { AUTH_YMQ_BROKER_FETCH, AuthYmqRoleBrokerClient } from "./auth-ymq-role-broker.client";
import { GroupStaffController } from "./group-staff.controller";
import { GroupStaffService } from "./group-staff.service";

@Module({
  controllers: [GroupStaffController],
  providers: [
    YmqRolesGuard,
    GroupStaffService,
    AuthYmqRoleBrokerClient,
    { provide: AUTH_YMQ_BROKER_FETCH, useValue: fetch },
  ],
  exports: [GroupStaffService, AuthYmqRoleBrokerClient],
})
export class GroupStaffModule {}
