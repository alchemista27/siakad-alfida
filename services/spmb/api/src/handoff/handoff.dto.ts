export interface SyncHandoffDto {
  registrationId: string;
}

export interface BatchSyncHandoffDto {
  registrationIds: string[];
}

export interface ConfirmEnrollmentDto {
  receiptId: string;
  sourceRegistrationId: string;
  destinationEnrollmentId: string;
  status: "accepted" | "enrolled";
}
