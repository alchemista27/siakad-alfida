import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { StudentDevelopmentController } from "./student-development.controller";
import { StudentDevelopmentService } from "./student-development.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [StudentDevelopmentController],
  providers: [StudentDevelopmentService],
  exports: [StudentDevelopmentService],
})
export class StudentDevelopmentModule {}
