import { Module } from "@nestjs/common";
import { RegistrationsController } from "./registrations.controller";
import { RegistrationsService } from "./registrations.service";
import { AdmissionCapacityService } from "./admission-capacity.service";
import { PaymentProofCloudinaryService } from "./payment-proof-cloudinary.service";

@Module({
  controllers: [RegistrationsController],
  providers: [RegistrationsService, AdmissionCapacityService, PaymentProofCloudinaryService],
  exports: [RegistrationsService, AdmissionCapacityService],
})
export class RegistrationsModule {}
