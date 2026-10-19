import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ExtracurricularsController } from "./extracurriculars.controller";
import { ExtracurricularsService } from "./extracurriculars.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ExtracurricularsController],
  providers: [ExtracurricularsService],
})
export class ExtracurricularsModule {}
