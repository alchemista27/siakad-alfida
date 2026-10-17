import { Module } from "@nestjs/common";
import { ImportsController } from "./imports.controller";
import { ImportsService } from "./imports.service";
import { AdmissionCapacityService } from "../registrations/admission-capacity.service";

@Module({
  controllers: [ImportsController],
  providers: [ImportsService, AdmissionCapacityService],
  exports: [ImportsService],
})
export class ImportsModule {}
