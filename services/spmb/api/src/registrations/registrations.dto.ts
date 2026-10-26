import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength, ValidateIf } from "class-validator";
import type { ParentRegistrationForm, StudentRegistrationForm } from "@alfida/contracts";

export type CreateOnlineRegistrationDto = { periodId: string };
export type SubmitStudentDataDto = StudentRegistrationForm;
export type SubmitParentDataDto = ParentRegistrationForm;

export class UploadPaymentDto {
  proofUrl: string;
  amount?: number;
}

export class PresignPaymentProofDto {
  @IsString()
  @MaxLength(255)
  fileName!: string;

  @IsString()
  @MaxLength(100)
  mimeType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  fileSize!: number;
}

export class FinalizePaymentProofDto extends PresignPaymentProofDto {
  @IsString()
  @MaxLength(1024)
  objectKey!: string;
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
