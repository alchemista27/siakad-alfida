export interface SingleDecisionDto {
  registrationId: string;
  status: "accepted" | "rejected";
  note?: string;
}

export interface BatchDecisionDto {
  registrationIds: string[];
  status: "accepted" | "rejected";
  note?: string;
}
