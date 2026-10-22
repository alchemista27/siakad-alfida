import { Module } from "@nestjs/common";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";
import { CurriculumController } from "./curriculum.controller";
import { CurriculumService } from "./curriculum.service";

@Module({
  controllers: [CurriculumController],
  providers: [YmqRolesGuard, CurriculumService],
  exports: [CurriculumService],
})
export class CurriculumModule {}
