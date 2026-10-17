export interface AssignObserverDto {
  userId: string;
  unitId: string;
}

export interface SubmitMyObservationResultDto {
  registrationId: string;
  score: number;
  notes?: string;
}
