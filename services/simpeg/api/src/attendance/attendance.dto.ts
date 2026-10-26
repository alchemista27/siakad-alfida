import {
  IsInt,
  IsBoolean,
  IsDateString,
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
import { hhmmMinutes } from "./jakarta-worktime";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

export function validWorkHours(input: {startTime?: string | null; lateGraceMinutes?: number | null; endTime?: string | null; overtimeStartTime?: string | null}): boolean {
  const { startTime, lateGraceMinutes, endTime, overtimeStartTime } = input;
  if (!startTime || !endTime || !overtimeStartTime || !Number.isInteger(lateGraceMinutes) ||
      (lateGraceMinutes as number) < 0 || (lateGraceMinutes as number) > 180 ||
      !HHMM.test(startTime) || !HHMM.test(endTime) || !HHMM.test(overtimeStartTime)) return false;
  return hhmmMinutes(startTime) < hhmmMinutes(endTime) && hhmmMinutes(endTime) <= hhmmMinutes(overtimeStartTime) &&
    hhmmMinutes(startTime) + (lateGraceMinutes as number) < 1440;
}

@ValidatorConstraint({ name: 'validSchedule', async: false })
class ValidScheduleConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: { object: object }): boolean {
    const input = args.object as UpsertUnitWorkScheduleDto;
    return input.isWorkday === false
      ? [input.startTime, input.lateGraceMinutes, input.endTime, input.overtimeStartTime].every(value => value === undefined || value === null)
      : input.isWorkday === true && validWorkHours(input);
  }
  defaultMessage(): string { return 'Jam jadwal kerja tidak valid atau tidak lengkap.'; }
}

export class UpsertUnitWorkScheduleDto {
  @IsBoolean()
  @Validate(ValidScheduleConstraint)
  isWorkday!: boolean;

  @IsOptional() @Matches(HHMM) startTime?: string;
  @IsOptional() @IsInt() @Min(0) @Max(180) lateGraceMinutes?: number;
  @IsOptional() @Matches(HHMM) endTime?: string;
  @IsOptional() @Matches(HHMM) overtimeStartTime?: string;
}

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

  @IsOptional() @IsNumber({ allowInfinity: false, allowNaN: false }) @Min(0) @Max(50)
  accuracyMeters?: number;

  @IsOptional() @IsDateString()
  capturedAt?: string;

  @IsOptional() @IsBoolean()
  mocked?: boolean;
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

  @IsOptional() @Matches(HHMM) startTime?: string;
  @IsOptional() @IsInt() @Min(0) @Max(180) lateGraceMinutes?: number;
  @IsOptional() @Matches(HHMM) endTime?: string;
  @IsOptional() @Matches(HHMM) overtimeStartTime?: string;
}
