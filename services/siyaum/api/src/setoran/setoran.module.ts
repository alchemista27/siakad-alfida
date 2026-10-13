import { Module } from "@nestjs/common";
import { SetoranController } from "./setoran.controller";
import { SetoranService } from "./setoran.service";

@Module({
  controllers: [SetoranController],
  providers: [SetoranService],
  exports: [SetoranService],
})
export class SetoranModule {}
