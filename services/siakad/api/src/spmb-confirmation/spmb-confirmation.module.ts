import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SpmbConfirmationController } from "./spmb-confirmation.controller";
import { SpmbConfirmationService } from "./spmb-confirmation.service";

@Module({
  imports: [AuthModule],
  controllers: [SpmbConfirmationController],
  providers: [SpmbConfirmationService],
  exports: [SpmbConfirmationService],
})
export class SpmbConfirmationModule {}
