import { Module } from "@nestjs/common";
import { BpiController } from "./bpi.controller";
import { BpiService } from "./bpi.service";

@Module({
  controllers: [BpiController],
  providers: [BpiService],
  exports: [BpiService],
})
export class BpiModule {}
