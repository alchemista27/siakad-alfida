import { Body, Controller, Param, Put, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { OrganizationUsersSyncService, UserProjection } from "./users.service";
import { InternalServiceGuard } from "./internal-service.guard";

const UserProjectionSchema = z.object({ id: z.string().uuid(), fullName: z.string().trim().min(1).max(200), email: z.string().email().max(255), username: z.string().trim().max(100).nullable().optional(), avatarUrl: z.string().url().nullable().optional(), isActive: z.boolean() });
@Controller("strategic/organization-sync/users")
@UseGuards(InternalServiceGuard)
export class OrganizationUsersSyncController {
  constructor(private readonly sync: OrganizationUsersSyncService) {}
  @Put(":id")
  put(@Param("id") id: string, @Body(new ZodValidationPipe(UserProjectionSchema)) body: UserProjection) {
    return this.sync.sync(id, body);
  }
}
