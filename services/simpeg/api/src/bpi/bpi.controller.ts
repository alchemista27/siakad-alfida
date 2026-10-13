import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { BpiService } from "./bpi.service";
import {
  UpsertLiqoGroupDto,
  AddLiqoMemberDto,
  CreateLiqoMeetingDto,
  SaveLiqoAttendanceDto,
  SaveMutabaahRecordDto,
} from "./bpi.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";

@Controller("bpi")
@UseGuards(ServiceJwtAuthGuard)
export class BpiController {
  constructor(private readonly bpiService: BpiService) {}

  @Get("groups")
  async getLiqoGroups() {
    return this.bpiService.getLiqoGroups();
  }

  @Post("groups")
  async upsertLiqoGroup(@Body() dto: UpsertLiqoGroupDto) {
    return this.bpiService.upsertLiqoGroup(dto);
  }

  @Get("groups/:id/members")
  async getLiqoMembers(@Param("id") id: string) {
    return this.bpiService.getLiqoMembers(id);
  }

  @Post("groups/members")
  async addLiqoMember(@Body() dto: AddLiqoMemberDto) {
    return this.bpiService.addLiqoMember(dto);
  }

  @Delete("groups/:groupId/members/:userId")
  async removeLiqoMember(
    @Param("groupId") groupId: string,
    @Param("userId") userId: string
  ) {
    return this.bpiService.removeLiqoMember(groupId, userId);
  }

  @Get("attendance-stats")
  async getLiqoAttendanceStats() {
    return this.bpiService.getLiqoAttendanceStats();
  }

  @Get("mutabaah-stats")
  async getGlobalMutabaahStats(
    @Query("start") start: string,
    @Query("end") end: string
  ) {
    const s = start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    const e = end || new Date().toISOString().slice(0, 10);
    return this.bpiService.getGlobalMutabaahStats(s, e);
  }

  // Murobbi routes
  @Get("murobbi/groups")
  async getMyMurobbiGroups(@Req() req: any) {
    return this.bpiService.getMyMurobbiGroups(req.user.id);
  }

  @Post("murobbi/groups/:groupId/meetings")
  async createLiqoMeeting(
    @Param("groupId") groupId: string,
    @Body() dto: CreateLiqoMeetingDto,
    @Req() req: any
  ) {
    return this.bpiService.createLiqoMeeting(req.user.id, groupId, dto);
  }

  @Post("murobbi/groups/:groupId/attendance")
  async saveLiqoAttendance(
    @Param("groupId") groupId: string,
    @Body() dto: SaveLiqoAttendanceDto,
    @Req() req: any
  ) {
    return this.bpiService.saveLiqoAttendance(req.user.id, groupId, dto);
  }

  // Staff (Mutarobbi) routes
  @Get("mutarobbi/group")
  async getMyLiqoGroup(@Req() req: any) {
    return this.bpiService.getMyLiqoGroup(req.user.id);
  }

  @Post("mutarobbi/mutabaah")
  async saveMutabaahRecord(@Body() dto: SaveMutabaahRecordDto, @Req() req: any) {
    return this.bpiService.saveMutabaahRecord(req.user.id, dto);
  }

  @Get("mutarobbi/mutabaah")
  async getMyMutabaah(
    @Query("start") start: string,
    @Query("end") end: string,
    @Req() req: any
  ) {
    return this.bpiService.getMyMutabaah(req.user.id, start, end);
  }
}
