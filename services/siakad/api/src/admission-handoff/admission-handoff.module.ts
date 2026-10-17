import { Module } from "@nestjs/common";
import { AdmissionHandoffController } from "./admission-handoff.controller";
import { AdmissionHandoffService } from "./admission-handoff.service";

@Module({
  controllers: [AdmissionHandoffController],
  providers: [AdmissionHandoffService],
  exports: [AdmissionHandoffService],
})
export class AdmissionHandoffModule {}
