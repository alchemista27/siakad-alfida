import { Module } from "@nestjs/common";
import { YmqEmployeesController } from "./ymq-employees.controller";
import { YmqEmployeesService } from "./ymq-employees.service";
import { SIMPEG_YMQ_FETCH, SimpegYmqProjectionClient } from "./simpeg-ymq-projection.client";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";

@Module({
  controllers: [YmqEmployeesController],
  providers: [
    YmqRolesGuard,
    YmqEmployeesService,
    SimpegYmqProjectionClient,
    { provide: SIMPEG_YMQ_FETCH, useValue: fetch },
  ],
  exports: [YmqEmployeesService],
})
export class YmqEmployeesModule {}
