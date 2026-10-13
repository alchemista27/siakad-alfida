import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { GroupsService } from "./groups.service";
import { UpsertGroupDto, AddMemberDto } from "./groups.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";

@Controller("groups")
@UseGuards(ServiceJwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async findAll() {
    return this.groupsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.groupsService.findOne(id);
  }

  @Post()
  async upsert(@Body() dto: UpsertGroupDto) {
    return this.groupsService.upsert(dto);
  }

  @Post("members")
  async addMember(@Body() dto: AddMemberDto) {
    return this.groupsService.addMember(dto);
  }

  @Delete(":groupId/members/:userId")
  async removeMember(
    @Param("groupId") groupId: string,
    @Param("userId") userId: string
  ) {
    return this.groupsService.removeMember(groupId, userId);
  }
}
