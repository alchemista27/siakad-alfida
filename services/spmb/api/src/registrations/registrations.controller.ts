import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { RegistrationsService } from "./registrations.service";
import {
  CreateOnlineRegistrationDto,
  CreateOfflineRegistrationDto,
  SubmitStudentDataDto,
  SubmitParentDataDto,
  UploadPaymentDto,
  VerifyPaymentDto,
} from "./registrations.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SpmbRolesGuard, SpmbRoles } from "../common/guards";
import { RegistrationSource, RegistrationStatus } from "../generated/prisma";

@Controller("registrations")
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  // ================= PUBLIK TRACKING =================
  @Get("track/:regNum")
  async trackByNumber(@Param("regNum") regNum: string) {
    return this.registrationsService.trackByNumber(regNum);
  }

  // ================= ORANG TUA =================
  @Get("parent/active")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async getActiveRegistration(@Req() req: any) {
    return this.registrationsService.getActiveRegistrationForParent(req.user.id);
  }

  @Post("online")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async createOnline(@Req() req: any, @Body() dto: CreateOnlineRegistrationDto) {
    return this.registrationsService.createOnline(req.user.id, dto);
  }

  @Post(":id/student")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async submitStudent(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: SubmitStudentDataDto
  ) {
    return this.registrationsService.submitStudentData(id, req.user.id, dto);
  }

  @Post(":id/parent")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async submitParent(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: SubmitParentDataDto
  ) {
    return this.registrationsService.submitParentData(id, req.user.id, dto);
  }

  @Post(":id/payment")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async uploadPayment(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: UploadPaymentDto
  ) {
    return this.registrationsService.uploadPayment(id, req.user.id, dto);
  }

  // ================= ADMIN UNIT / TIM PPDB =================
  @Get()
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async findAll(
    @Query("periodId") periodId?: string,
    @Query("status") status?: RegistrationStatus,
    @Query("source") source?: RegistrationSource,
    @Query("search") search?: string
  ) {
    return this.registrationsService.findAll({ periodId, status, source, search });
  }

  @Get(":id")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async findOne(@Param("id") id: string) {
    return this.registrationsService.findOne(id);
  }

  @Post("offline")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async createOffline(@Req() req: any, @Body() dto: CreateOfflineRegistrationDto) {
    return this.registrationsService.createOffline(req.user.id, dto);
  }

  @Post(":id/verify-payment")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async verifyPayment(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: VerifyPaymentDto
  ) {
    return this.registrationsService.verifyPayment(id, req.user.id, dto);
  }
}
