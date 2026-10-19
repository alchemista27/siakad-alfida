import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ImporterController } from "./importer.controller";
import { ImporterService } from "./importer.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ImporterController],
  providers: [ImporterService],
})
export class ImporterModule {}
