export interface CreateScheduleDto {
  periodId: string;
  date: string;
  startTime: string;
  endTime: string;
  quota: number;
}

export interface UpdateScheduleDto {
  date?: string;
  startTime?: string;
  endTime?: string;
  quota?: number;
}

export interface BookScheduleDto {
  registrationId: string;
  observationScheduleId: string;
}

export interface SubmitObservationResultDto {
  registrationId: string;
  score: number;
  notes?: string;
}
