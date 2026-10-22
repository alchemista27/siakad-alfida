import { Module } from "@nestjs/common";
import { InternalServiceAuthGuard } from "./internal-service-auth.guard";
import { YmqEmployeeProjectionController } from "./ymq-employee-projection.controller";
import { YmqEmployeeProjectionService } from "./ymq-employee-projection.service";

@Module({
  controllers: [YmqEmployeeProjectionController],
  providers: [InternalServiceAuthGuard, YmqEmployeeProjectionService],
})
export class YmqEmployeeProjectionModule {}
