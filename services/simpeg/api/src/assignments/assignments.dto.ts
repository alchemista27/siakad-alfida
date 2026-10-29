import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateAssignmentDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  unitId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  role!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  skNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  notes?: string | null;
}

export class UpdateAssignmentDto {
  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  role?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  skNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  notes?: string | null;
}

export class MutateAssignmentDto {
  @IsUUID()
  unitId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  role!: string;

  @IsDateString()
  effectiveDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  skNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  notes?: string | null;
}
