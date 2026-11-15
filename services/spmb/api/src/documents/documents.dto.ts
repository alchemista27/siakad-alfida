import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUrl, IsUUID, Max, MaxLength, Min } from "class-validator";
import { DocumentType } from "../generated/prisma";

export class PresignUploadDto {
  @IsUUID()
  registrationId!: string;

  @IsEnum(DocumentType)
  documentType!: DocumentType;

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

export class UpsertDocumentDto extends PresignUploadDto {
  @IsUrl({ protocols: ["https"], require_protocol: true })
  @MaxLength(2048)
  fileUrl!: string;
}

export class SubmitTkHealthDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(250)
  heightCm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(300)
  weightKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(100)
  headCircumferenceCm?: number;

  @IsOptional()
  @IsIn(["complete", "incomplete", "unknown"])
  immunizationStatus?: "complete" | "incomplete" | "unknown";
}
