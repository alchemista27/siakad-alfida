import { Body, Controller, Param, Put, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { OrganizationSyncService, DepartmentSyncPayload } from "./organization-sync.service";
import { InternalServiceGuard } from "./internal-service.guard";

const DepartmentSyncSchema = z.object({ id: z.string().uuid(), name: z.string().trim().min(1).max(100), code: z.string().trim().min(1).max(50), description: z.string().trim().max(2000).nullable().optional(), isActive: z.boolean(), updatedAt: z.string().datetime() });

@Controller("strategic/organization-sync/departments")
@UseGuards(InternalServiceGuard)
export class OrganizationSyncController {
  constructor(private readonly sync: OrganizationSyncService) {}
  @Put(":id")
  put(@Param("id") id: string, @Body(new ZodValidationPipe(DepartmentSyncSchema)) body: DepartmentSyncPayload) {
    return this.sync.syncDepartment(id, body);
  }
}
