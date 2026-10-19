import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { LessonPlansController } from "./lesson-plans.controller";
import { LessonPlansService } from "./lesson-plans.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LessonPlansController],
  providers: [LessonPlansService],
})
export class LessonPlansModule {}
