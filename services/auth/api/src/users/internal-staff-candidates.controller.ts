import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { InternalOrganizationRolesGuard } from "./internal-organization-roles.guard";
import { UsersService } from "./users.service";

@Controller("users/internal-staff-candidates")
@UseGuards(InternalOrganizationRolesGuard)
export class InternalStaffCandidatesController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findMany(@Query("search") search?: string) {
    return this.usersService.findInternalStaffCandidates(search);
  }

  @Get(":userId")
  findOne(@Param("userId") userId: string) {
    return this.usersService.requireInternalStaffCandidate(userId);
  }
}
