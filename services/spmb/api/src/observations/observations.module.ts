import { Module } from "@nestjs/common";
import { ObservationsController } from "./observations.controller";
import { ObservationsService } from "./observations.service";
import { ObserversModule } from "../observers/observers.module";

@Module({
  imports: [ObserversModule],
  controllers: [ObservationsController],
  providers: [ObservationsService],
  exports: [ObservationsService],
})
export class ObservationsModule {}
