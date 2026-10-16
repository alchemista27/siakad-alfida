import { IsInt, IsLatitude, IsLongitude, IsUUID, Max, Min } from "class-validator";

export class GpsCheckInOutDto {
  latitude: number;
  longitude: number;
}

export class UpsertGpsConfigDto {
  @IsUUID()
  unitId!: string;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsInt()
  @Min(10)
  @Max(1000)
  radiusMeters!: number;
}

export class UpsertHolidayDto {
  id?: string;
  unitId?: string;
  date: string;
  name: string;
  description?: string;
}
