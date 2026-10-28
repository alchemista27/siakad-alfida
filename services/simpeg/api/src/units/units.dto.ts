import { ArrayNotEmpty, ArrayUnique, IsArray, IsBoolean, IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateUnitDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code!: string;

  @IsIn(["pendidikan", "nondik"])
  category!: "pendidikan" | "nondik";

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  address?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUnitDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsIn(["pendidikan", "nondik"])
  category?: "pendidikan" | "nondik";

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  address?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssignUnitAdminDto {
  @IsUUID()
  userId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsIn(["siakad", "spmb", "simpeg"], { each: true })
  apps!: Array<"siakad" | "spmb" | "simpeg">;
}

export class UpdateUnitLetterheadDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  logoUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  principalName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  principalSignatureUrl?: string | null;
}
