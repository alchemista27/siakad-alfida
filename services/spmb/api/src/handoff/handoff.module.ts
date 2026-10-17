import { Module } from "@nestjs/common";
import { HandoffController } from "./handoff.controller";
import { HandoffService } from "./handoff.service";
import { HandoffProcessor } from "./handoff.processor";

@Module({
  controllers: [HandoffController],
  providers: [HandoffService, HandoffProcessor],
  exports: [HandoffService, HandoffProcessor],
})
export class HandoffModule {}
