import { IsUUID } from "class-validator";

export class AssignDepartmentAdminDto {
  @IsUUID()
  userId!: string;
}
