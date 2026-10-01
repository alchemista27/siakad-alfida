import { IsString, IsOptional, IsUUID, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@sim/database';

export class CreateMeetingAttendanceDto {
  @IsUUID()
  userId: string;

  @IsString()
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateExecutionMeetingDto {
  @IsOptional()
  @IsUUID()
  programId?: string;

  @IsString()
  title: string;

  @IsString()
  agenda: string;

  @IsDateString()
  meetingDate: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUUID()
  organizerId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateExecutionMeetingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  agenda?: string;

  @IsOptional()
  @IsDateString()
  meetingDate?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
