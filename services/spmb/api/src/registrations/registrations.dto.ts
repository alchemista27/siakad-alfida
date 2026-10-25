import { IsBoolean, IsOptional, IsString, Matches, MinLength, ValidateIf } from "class-validator";
import type { ParentRegistrationForm, StudentRegistrationForm } from "@alfida/contracts";

export type CreateOnlineRegistrationDto = { periodId: string };
export type SubmitStudentDataDto = StudentRegistrationForm;
export type SubmitParentDataDto = ParentRegistrationForm;

export class UploadPaymentDto {
  proofUrl: string;
  amount?: number;
}

export class VerifyPaymentDto {
  @IsBoolean()
  isApproved: boolean;

  @IsOptional()
  @IsString()
  rejectionNote?: string;
}

export class ReviewDossierDto {
  @IsBoolean()
  isApproved!: boolean;

  @ValidateIf((dto) => dto.isApproved === false)
  @IsString()
  @MinLength(3)
  @Matches(/\S/)
  rejectionNote?: string;
}
