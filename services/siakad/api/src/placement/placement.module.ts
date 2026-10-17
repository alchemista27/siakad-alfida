import { Module } from "@nestjs/common";
import { PlacementController } from "./placement.controller";
import { PlacementService } from "./placement.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [PlacementController],
  providers: [PlacementService],
  exports: [PlacementService],
})
export class PlacementModule {}
