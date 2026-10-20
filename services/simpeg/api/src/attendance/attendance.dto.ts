import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
  Validate,
  ValidateIf,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { Type } from "class-transformer";
import { utcDate } from "./workday-policy";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

@ValidatorConstraint({ name: "isUtcSaturday", async: false })
class IsUtcSaturdayConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== "string" || !DATE_ONLY.test(value)) return false;
    try {
      return utcDate(value).getUTCDay() === 6;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return "Tanggal piket harus hari Sabtu dalam format YYYY-MM-DD.";
  }
}

export class GpsCheckInOutDto {
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsLatitude()
  latitude!: number;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsLongitude()
  longitude!: number;
}

export class UpsertGpsConfigDto {
  @IsUUID()
  unitId!: string;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsLatitude()
  latitude!: number;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsLongitude()
  longitude!: number;

  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(1000)
  radiusMeters!: number;
}

export class UpsertHolidayDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @ValidateIf((dto) => dto.unitId !== undefined && dto.unitId !== null)
  @IsUUID()
  unitId?: string | null;

  @Matches(DATE_ONLY, { message: "date harus menggunakan format YYYY-MM-DD." })
  date!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;
}

export class UpsertSaturdayDutyAssignmentDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsUUID()
  unitId!: string;

  @IsUUID()
  userId!: string;

  @Matches(DATE_ONLY, { message: "date harus menggunakan format YYYY-MM-DD." })
  @Validate(IsUtcSaturdayConstraint)
  date!: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  notes?: string;
}
