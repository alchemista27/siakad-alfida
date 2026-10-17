import { Module } from "@nestjs/common";
import { ObserversController } from "./observers.controller";
import { ObserversService } from "./observers.service";

@Module({
  controllers: [ObserversController],
  providers: [ObserversService],
})
export class ObserversModule {}
