import { Module } from "@nestjs/common";
import { RegistrationsController } from "./registrations.controller";
import { RegistrationsService } from "./registrations.service";
import { AdmissionCapacityService } from "./admission-capacity.service";

@Module({
  controllers: [RegistrationsController],
  providers: [RegistrationsService, AdmissionCapacityService],
  exports: [RegistrationsService, AdmissionCapacityService],
})
export class RegistrationsModule {}
