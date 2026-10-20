import { Gender, ParentType } from "../generated/prisma";
import { IsBoolean, IsOptional, IsString, Matches, MinLength, ValidateIf } from "class-validator";

export class CreateOnlineRegistrationDto {
  periodId: string;
  applicantFullName?: string;
  applicantGender?: "male" | "female";
  applicantBirthPlace?: string;
  applicantBirthDate?: string;
  applicantNisn?: string;
  applicantAddress?: string;
}


export class SubmitStudentDataDto {
  fullName: string;
  nickname?: string;
  gender: "male" | "female";
  birthPlace: string;
  birthDate: string;
  nisn?: string;
  siblingsCount?: number;
  address: string;
  transportation?: string;
  hobby?: string;
  ambition?: string;
}

export class SubmitParentDataDto {
  father?: {
    fullName: string;
    nik?: string;
    birthPlace?: string;
    birthDate?: string;
    education?: string;
    occupation?: string;
    phone?: string;
    incomeRange?: string;
    address?: string;
  };
  mother?: {
    fullName: string;
    nik?: string;
    birthPlace?: string;
    birthDate?: string;
    education?: string;
    occupation?: string;
    phone?: string;
    incomeRange?: string;
    address?: string;
  };
}

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
