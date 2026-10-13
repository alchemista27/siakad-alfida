import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { LeavesService } from "./leaves.service";
import { CreateLeaveDto, ProcessLeaveDto } from "./leaves.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { LeaveStatus } from "../generated/prisma";

@Controller("leaves")
@UseGuards(ServiceJwtAuthGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Get()
  async findAll(
    @Query("status") status?: LeaveStatus,
    @Query("year") year?: string
  ) {
    const y = year ? parseInt(year, 10) : undefined;
    return this.leavesService.findAll(status, y);
  }

  @Get("my")
  async findMyLeaves(@Req() req: any) {
    return this.leavesService.findMyLeaves(req.user.id);
  }

  @Post("my")
  async createMyLeave(@Req() req: any, @Body() dto: CreateLeaveDto) {
    return this.leavesService.create(req.user.id, dto);
  }

  @Post(":id/approve")
  async approve(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: ProcessLeaveDto
  ) {
    const roles = req.user?.roles || [];
    const isAuthorized = roles.some((r: any) =>
      r.role === "super_admin" ||
      r.role === "admin_kepegawaian" ||
      r.role === "admin_unit" ||
      r.role === "admin_bidang"
    );
    if (!isAuthorized) {
      throw new ForbiddenException("Hanya admin kepegawaian atau kepala unit yang berhak menyetujui cuti.");
    }
    return this.leavesService.approve(id, req.user.id, dto);
  }

  @Post(":id/reject")
  async reject(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: ProcessLeaveDto
  ) {
    const roles = req.user?.roles || [];
    const isAuthorized = roles.some((r: any) =>
      r.role === "super_admin" ||
      r.role === "admin_kepegawaian" ||
      r.role === "admin_unit" ||
      r.role === "admin_bidang"
    );
    if (!isAuthorized) {
      throw new ForbiddenException("Hanya admin kepegawaian atau kepala unit yang berhak menolak cuti.");
    }
    return this.leavesService.reject(id, req.user.id, dto);
  }
}

