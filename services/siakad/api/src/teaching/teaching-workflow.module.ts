import { Module } from "@nestjs/common";
import { TeachingWorkflowController } from "./teaching-workflow.controller";
import { TeachingWorkflowService } from "./teaching-workflow.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [TeachingWorkflowController],
  providers: [TeachingWorkflowService],
  exports: [TeachingWorkflowService],
})
export class TeachingWorkflowModule {}
