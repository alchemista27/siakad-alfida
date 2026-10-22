import { Module } from "@nestjs/common";
import { InternalYmqRoleBrokerGuard } from "./internal-ymq-role-broker.guard";
import { YmqRoleBrokerController } from "./ymq-role-broker.controller";
import { YmqRoleBrokerService } from "./ymq-role-broker.service";

@Module({
  controllers: [YmqRoleBrokerController],
  providers: [YmqRoleBrokerService, InternalYmqRoleBrokerGuard],
})
export class YmqRoleBrokerModule {}
