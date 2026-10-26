import { Module } from "@nestjs/common";
import { RegistrationsController } from "./registrations.controller";
import { RegistrationsService } from "./registrations.service";
import { AdmissionCapacityService } from "./admission-capacity.service";
import { PaymentProofStorageService } from "./payment-proof-storage.service";

@Module({
  controllers: [RegistrationsController],
  providers: [RegistrationsService, AdmissionCapacityService, PaymentProofStorageService],
  exports: [RegistrationsService, AdmissionCapacityService],
})
export class RegistrationsModule {}
