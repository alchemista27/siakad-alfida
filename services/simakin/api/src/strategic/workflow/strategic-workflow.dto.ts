import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { WorkflowStatus } from "./strategic-workflow";

export class TransitionStrategicWorkflowDto {
  @IsIn(["draft", "submitted_to_biro", "revision_requested_by_biro", "accepted_by_biro", "submitted_to_bidang", "revision_requested_by_bidang", "approved_by_bidang"])
  toStatus!: WorkflowStatus;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}
