import { Module } from "@nestjs/common";
import { LhbsController } from "./lhbs.controller";
import { LhbsService } from "./lhbs.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [LhbsController],
  providers: [LhbsService],
  exports: [LhbsService],
})
export class LhbsModule {}
