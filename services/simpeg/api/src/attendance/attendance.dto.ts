export class GpsCheckInOutDto {
  latitude: number;
  longitude: number;
}

export class UpsertGpsConfigDto {
  unitId: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
}

export class UpsertHolidayDto {
  id?: string;
  unitId?: string;
  date: string;
  name: string;
  description?: string;
}
