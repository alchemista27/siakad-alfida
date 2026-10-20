import { Body, Controller, Param, Put, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { DepartmentMemberProjection, DepartmentMembersSyncService } from "./department-members.service";
import { InternalServiceGuard } from "./internal-service.guard";

const DepartmentMemberProjectionSchema = z
  .object({
    id: z.string().uuid(),
    departmentId: z.string().uuid(),
    userId: z.string().uuid(),
    role: z.string().trim().max(50).nullable(),
    sourceUpdatedAt: z.string().datetime(),
  })
  .strict();

@Controller("strategic/organization-sync/department-members")
@UseGuards(InternalServiceGuard)
export class DepartmentMembersSyncController {
  constructor(private readonly sync: DepartmentMembersSyncService) {}

  @Put(":id")
  put(
    @Param("id", new ZodValidationPipe(z.string().uuid())) id: string,
    @Body(new ZodValidationPipe(DepartmentMemberProjectionSchema)) body: DepartmentMemberProjection,
  ) {
    return this.sync.sync(id, body);
  }
}
