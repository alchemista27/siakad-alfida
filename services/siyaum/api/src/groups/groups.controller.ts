import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { GroupsService } from "./groups.service";
import { UpsertGroupDto, AddMemberDto } from "./groups.dto";
import { YmqRoles } from "../ymq/ymq-roles.decorator";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";

@Controller("groups")
@UseGuards(ServiceJwtAuthGuard, YmqRolesGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @YmqRoles("admin_ymq", "pembina_ymq", "admin_kelompok", "pengawas", "pimpinan", "peserta")
  findAll(@Req() req: any) {
    return this.groupsService.findAll(req.user);
  }

  @Get(":id")
  @YmqRoles("admin_ymq", "pembina_ymq", "admin_kelompok", "pengawas", "pimpinan", "peserta")
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.groupsService.findOne(id, req.user);
  }

  @Post()
  @YmqRoles("admin_ymq")
  upsert(@Body() dto: UpsertGroupDto, @Req() req: any) {
    return this.groupsService.upsert(dto, req.user);
  }

  @Post("members")
  @YmqRoles("admin_ymq")
  addMember(@Body() dto: AddMemberDto, @Req() req: any) {
    return this.groupsService.addMember(dto, req.user);
  }

  @Delete(":groupId/members/:userId")
  @YmqRoles("admin_ymq")
  removeMember(
    @Param("groupId") groupId: string,
    @Param("userId") userId: string,
    @Req() req: any,
  ) {
    return this.groupsService.removeMember(groupId, userId, req.user);
  }
}
