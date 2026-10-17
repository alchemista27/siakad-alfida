import { Gender, ParentType, RegistrationStatus } from "../generated/prisma";
import { IsBoolean, IsOptional, IsString, Matches, MinLength, ValidateIf } from "class-validator";
import type { BackfillManifest } from "../imports/backfill-manifest.policy";

export class CreateOnlineRegistrationDto {
  periodId: string;
  applicantFullName?: string;
  applicantGender?: "male" | "female";
  applicantBirthPlace?: string;
  applicantBirthDate?: string;
  applicantNisn?: string;
  applicantAddress?: string;
}

export class CreateOfflineRegistrationDto {
  periodId: string;
  externalRef?: string; // nomor pendaftaran manual/kertas
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  initialStatus?: RegistrationStatus; // deprecated: ignored in favor of manifest-derived status
  manifest?: BackfillManifest;
  // Data Siswa langsung (opsional jika sudah ada)
  student?: {
    fullName: string;
    nickname?: string;
    gender: "male" | "female";
    birthPlace: string;
    birthDate: string;
    nisn?: string;
    address: string;
  };
  // Pembayaran offline (opsional jika sudah bayar di bendahara)
  isPaid?: boolean;
  paidAmount?: number;
  paidDate?: string;
  // Observasi offline (opsional jika sudah diobservasi)
  observationScore?: number;
  observationNotes?: string;
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
