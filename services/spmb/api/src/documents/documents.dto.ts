import { Type } from "class-transformer";
import { IsEnum, IsInt, IsString, IsUUID, MaxLength, Min } from "class-validator";
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
  @IsString()
  @MaxLength(1024)
  objectKey!: string;
}
