import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";

export class CreatePeriodDto {
  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsOptional()
  @IsUUID()
  sourceAcademicYearId?: string;

  @IsString()
  @MaxLength(200)
  unitName: string;

  @IsString()
  @MaxLength(100)
  unitSlug: string;

  @IsString()
  @MaxLength(50)
  label: string;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  quota?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  fee?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  bankHolder?: string;

  @IsOptional()
  @IsDateString()
  opensAt?: string;

  @IsOptional()
  @IsDateString()
  closesAt?: string;
}

export class UpdatePeriodDto {
  @IsOptional()
  @IsUUID()
  sourceAcademicYearId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  label?: string;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  quota?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  fee?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  bankHolder?: string | null;

  @IsOptional()
  @IsDateString()
  opensAt?: string | null;

  @IsOptional()
  @IsDateString()
  closesAt?: string | null;
}
