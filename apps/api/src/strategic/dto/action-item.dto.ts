import { IsString, IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { ExecutionStatus } from '@sim/database';

export class CreateExecutionActionItemDto {
  @IsOptional()
  @IsUUID()
  meetingId?: string;

  @IsOptional()
  @IsUUID()
  issueId?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsUUID()
  picId?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus;
}

export class UpdateExecutionActionItemDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  picId?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus;
}
