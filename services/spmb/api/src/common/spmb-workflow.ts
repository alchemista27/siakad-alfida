import { BadRequestException } from "@nestjs/common";

export const registrationStatuses = [
  "pending_payment",
  "payment_uploaded",
  "payment_verified",
  "form_filling",
  "documents_uploaded",
  "medical_pending",
  "medical_uploaded",
  "verification",
  "observation_scheduled",
  "observation_done",
  "accepted",
  "rejected",
  "enrolled",
] as const;

export type SpmbRegistrationStatus = (typeof registrationStatuses)[number];

export const allowedTransitions: Readonly<Record<SpmbRegistrationStatus, readonly SpmbRegistrationStatus[]>> = {
  pending_payment: ["payment_uploaded"],
  payment_uploaded: ["payment_verified", "pending_payment"],
  payment_verified: ["form_filling"],
  form_filling: ["documents_uploaded"],
  documents_uploaded: ["medical_pending"],
  medical_pending: ["medical_uploaded"],
  medical_uploaded: ["verification"],
  verification: ["observation_scheduled", "documents_uploaded"],
  observation_scheduled: ["observation_done"],
  observation_done: ["accepted", "rejected"],
  accepted: ["enrolled"],
  rejected: [],
  enrolled: [],
};

export function assertTransition(from: SpmbRegistrationStatus, to: SpmbRegistrationStatus): void {
  if (!allowedTransitions[from].includes(to)) {
    throw new BadRequestException(`Transisi SPMB tidak valid: ${from} → ${to}`);
  }
}

export type ParentNextAction =
  | "upload_payment"
  | "wait_payment_verification"
  | "complete_form"
  | "upload_documents"
  | "upload_medical_result"
  | "wait_verification"
  | "book_observation"
  | "wait_observation"
  | "view_decision"
  | "enrollment";

export const baseRequiredDocumentTypes = [
  "photo",
  "birth_certificate",
  "family_card",
  "father_id",
  "mother_id",
] as const;

export const requiredDocumentTypes = [
  ...baseRequiredDocumentTypes,
  "medical_result",
] as const;

export function canTransition(from: SpmbRegistrationStatus, to: SpmbRegistrationStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function getParentNextAction(status: SpmbRegistrationStatus): ParentNextAction {
  switch (status) {
    case "pending_payment":
      return "upload_payment";
    case "payment_uploaded":
      return "wait_payment_verification";
    case "payment_verified":
    case "form_filling":
      return "complete_form";
    case "documents_uploaded":
      return "upload_documents";
    case "medical_pending":
      return "upload_medical_result";
    case "medical_uploaded":
    case "verification":
      return "wait_verification";
    case "observation_scheduled":
      return "wait_observation";
    case "observation_done":
    case "rejected":
      return "view_decision";
    case "accepted":
      return "enrollment";
    case "enrolled":
      return "enrollment";
  }
}
