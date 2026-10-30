import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SpmbRoles, SpmbRolesGuard } from "../common/guards";
import { AssignObserverDto, SubmitMyObservationResultDto } from "./observers.dto";
import { ObserversService } from "./observers.service";

@Controller("observers")
export class ObserversController {
  constructor(private readonly observersService: ObserversService) {}

  @Get()
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_spmb")
  list(@Req() req: any, @Query("periodId") periodId?: string) {
    if (!periodId) throw new BadRequestException("periodId wajib diisi");
    return this.observersService.list(req.user, periodId);
  }

  @Get("candidates")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit")
  candidates(@Req() req: any, @Query("unitId") unitId?: string, @Query("search") search = "") {
    if (!unitId) throw new BadRequestException("unitId wajib diisi");
    return this.observersService.listCandidates(req.user, unitId, search);
  }

  @Post()
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit")
  assign(@Req() req: any, @Body() dto: AssignObserverDto) {
    return this.observersService.assign(req.user, dto);
  }

  @Get("me/worklist")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("observer")
  getMyWorklist(@Req() req: any, @Query("periodId") periodId?: string) {
    if (!periodId) throw new BadRequestException("periodId wajib diisi");
    return this.observersService.getMyWorklist(req.user, periodId);
  }

  @Get("me/rankings")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("observer")
  getMyRankings(@Req() req: any, @Query("periodId") periodId?: string) {
    if (!periodId) throw new BadRequestException("periodId wajib diisi");
    return this.observersService.getMyRankings(req.user, periodId);
  }

  @Post("me/results")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("observer")
  submitMyResult(@Req() req: any, @Body() dto: SubmitMyObservationResultDto) {
    return this.observersService.submitMyResult(req.user, dto);
  }

  @Delete(":userId")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit")
  deactivate(@Req() req: any, @Param("userId") userId: string, @Query("unitId") unitId?: string) {
    if (!unitId) throw new BadRequestException("unitId wajib diisi");
    return this.observersService.deactivate(req.user, userId, unitId);
  }
}
