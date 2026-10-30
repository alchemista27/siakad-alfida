import { Module } from "@nestjs/common";
import { EmployeesController } from "./employees.controller";
import { EmployeesService } from "./employees.service";
import { InternalObserverCandidatesController } from "./internal-observer-candidates.controller";
import { InternalServiceAuthGuard } from "../ymq-projection/internal-service-auth.guard";

@Module({
  controllers: [EmployeesController, InternalObserverCandidatesController],
  providers: [EmployeesService, InternalServiceAuthGuard],
  exports: [EmployeesService],
})
export class EmployeesModule {}
