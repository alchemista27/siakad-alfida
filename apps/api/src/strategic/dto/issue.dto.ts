import { IsString, IsOptional, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ExecutionStatus, ExecutionPriority } from '@sim/database';

export class CreateExecutionIssueDto {
  @IsUUID()
  programId: string;

  @IsOptional()
  @IsUUID()
  milestoneId?: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  impactScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  probabilityScore?: number;

  @IsOptional()
  @IsString()
  mitigationPlan?: string;

  @IsOptional()
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus;

  @IsOptional()
  @IsEnum(ExecutionPriority)
  priority?: ExecutionPriority;

  @IsOptional()
  @IsUUID()
  reporterId?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}

export class UpdateExecutionIssueDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  impactScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  probabilityScore?: number;

  @IsOptional()
  @IsString()
  mitigationPlan?: string;

  @IsOptional()
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus;

  @IsOptional()
  @IsEnum(ExecutionPriority)
  priority?: ExecutionPriority;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}
