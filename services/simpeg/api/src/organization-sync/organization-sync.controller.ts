import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SimpegRoles, SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { OrganizationSyncProcessor } from "./organization-sync.processor";

@Controller("organization-sync")
@UseGuards(ServiceJwtAuthGuard, SimpegRolesGuard)
export class OrganizationSyncController {
  constructor(private readonly processor: OrganizationSyncProcessor) {}

  @Post("retry/:id")
  @SimpegRoles("super_admin", "admin_kepegawaian")
  retry(@Param("id") id: string) {
    return this.processor.retry(id);
  }
}
