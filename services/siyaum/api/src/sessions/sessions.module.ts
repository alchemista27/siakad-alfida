import { Module } from "@nestjs/common";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";
import { SessionsController } from "./sessions.controller";
import { SessionsService } from "./sessions.service";

@Module({
  controllers: [SessionsController],
  providers: [YmqRolesGuard, SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
