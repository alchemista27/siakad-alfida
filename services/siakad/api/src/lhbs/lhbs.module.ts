import { Module } from "@nestjs/common";
import { LhbsController } from "./lhbs.controller";
import { LhbsService } from "./lhbs.service";
import { LhbsPdfService } from "./lhbs-pdf.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [LhbsController],
  providers: [LhbsService, LhbsPdfService],
  exports: [LhbsService],
})
export class LhbsModule {}
