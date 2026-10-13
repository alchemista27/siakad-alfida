export interface CreateScheduleDto {
  periodId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  quota: number;
}

export interface BookScheduleDto {
  registrationId: string;
  observationScheduleId: string;
}

export interface SubmitObservationResultDto {
  registrationId: string;
  score: number;
  notes?: string;
  observerId?: string;
}
