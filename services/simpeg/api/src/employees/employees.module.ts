import { Module } from "@nestjs/common";
import { EmployeesController } from "./employees.controller";
import { EmployeesService } from "./employees.service";
import { InternalObserverCandidatesController } from "./internal-observer-candidates.controller";
import { InternalServiceAuthGuard } from "../ymq-projection/internal-service-auth.guard";
import { AuthStaffCandidateClient, AUTH_STAFF_CANDIDATE_FETCH } from "./auth-staff-candidate.client";

@Module({
  controllers: [EmployeesController, InternalObserverCandidatesController],
  providers: [
    EmployeesService,
    InternalServiceAuthGuard,
    AuthStaffCandidateClient,
    { provide: AUTH_STAFF_CANDIDATE_FETCH, useValue: fetch },
  ],
  exports: [EmployeesService, AuthStaffCandidateClient],
})
export class EmployeesModule {}
