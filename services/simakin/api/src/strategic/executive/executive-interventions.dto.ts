import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateExecutiveInterventionDto {
  @IsUUID()
  departmentId!: string;

  @IsOptional()
  @IsIn(["work_program", "kpi", "realization_log", "evidence", "issue"])
  resourceType?: "work_program" | "kpi" | "realization_log" | "evidence" | "issue";

  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @IsUUID()
  recipientId!: string;

  @IsString()
  @MaxLength(4000)
  message!: string;
}
