import { Module } from "@nestjs/common";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";
import { EvidenceController } from "./evidence.controller";
import { EvidenceService } from "./evidence.service";

@Module({
  controllers: [EvidenceController],
  providers: [YmqRolesGuard, EvidenceService],
})
export class EvidenceModule {}
