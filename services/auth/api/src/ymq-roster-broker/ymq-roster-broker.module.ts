import { Module } from "@nestjs/common";
import { InternalYmqRoleBrokerGuard } from "../ymq-role-broker/internal-ymq-role-broker.guard";
import { YmqRosterBrokerController } from "./ymq-roster-broker.controller";
import { YmqRosterBrokerService } from "./ymq-roster-broker.service";

@Module({
  controllers: [YmqRosterBrokerController],
  providers: [YmqRosterBrokerService, InternalYmqRoleBrokerGuard],
})
export class YmqRosterBrokerModule {}
