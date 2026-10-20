import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SpmbConfirmationController } from "./spmb-confirmation.controller";
import { SPMB_CONFIRMATION_FETCH, SpmbConfirmationService } from "./spmb-confirmation.service";

@Module({
  imports: [AuthModule],
  controllers: [SpmbConfirmationController],
  providers: [
    { provide: SPMB_CONFIRMATION_FETCH, useValue: fetch },
    SpmbConfirmationService,
  ],
  exports: [SpmbConfirmationService],
})
export class SpmbConfirmationModule {}
