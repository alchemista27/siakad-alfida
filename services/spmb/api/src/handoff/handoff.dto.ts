export interface SyncHandoffDto {
  registrationId: string;
}

export interface BatchSyncHandoffDto {
  registrationIds: string[];
}

export interface ConfirmEnrollmentDto {
  confirmationId: string;
  receiptId: string;
  sourceRegistrationId: string;
  destinationEnrollmentId: string;
  status: "enrolled";
}
