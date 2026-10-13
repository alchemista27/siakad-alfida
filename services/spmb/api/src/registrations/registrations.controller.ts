import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
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
  @UseGuards(ServiceJwtAuthGuard)
  async getActiveRegistration(@Req() req: any) {
    return this.registrationsService.getActiveRegistrationForParent(req.user.id);
  }

  @Post("online")
  @UseGuards(ServiceJwtAuthGuard)
  async createOnline(@Req() req: any, @Body() dto: CreateOnlineRegistrationDto) {
    return this.registrationsService.createOnline(req.user.id, dto);
  }

  @Post(":id/student")
  @UseGuards(ServiceJwtAuthGuard)
  async submitStudent(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: SubmitStudentDataDto
  ) {
    return this.registrationsService.submitStudentData(id, req.user.id, dto);
  }

  @Post(":id/parent")
  @UseGuards(ServiceJwtAuthGuard)
  async submitParent(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: SubmitParentDataDto
  ) {
    return this.registrationsService.submitParentData(id, req.user.id, dto);
  }

  @Post(":id/payment")
  @UseGuards(ServiceJwtAuthGuard)
  async uploadPayment(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: UploadPaymentDto
  ) {
    return this.registrationsService.uploadPayment(id, req.user.id, dto);
  }

  // ================= ADMIN UNIT =================
  @Get()
  @UseGuards(ServiceJwtAuthGuard)
  async findAll(
    @Req() req: any,
    @Query("periodId") periodId?: string,
    @Query("status") status?: RegistrationStatus,
    @Query("source") source?: RegistrationSource,
    @Query("search") search?: string
  ) {
    const roles = req.user?.roles || [];
    const isAuthorized = roles.some((r: any) =>
      r.role === "super_admin" || r.role === "admin_unit" || r.role === "tim_ppdb"
    );
    if (!isAuthorized) {
      throw new ForbiddenException("Hanya admin unit yang dapat melihat seluruh pendaftar.");
    }
    return this.registrationsService.findAll({ periodId, status, source, search });
  }

  @Get(":id")
  @UseGuards(ServiceJwtAuthGuard)
  async findOne(@Param("id") id: string) {
    return this.registrationsService.findOne(id);
  }

  @Post("offline")
  @UseGuards(ServiceJwtAuthGuard)
  async createOffline(@Req() req: any, @Body() dto: CreateOfflineRegistrationDto) {
    const roles = req.user?.roles || [];
    const isAuthorized = roles.some((r: any) =>
      r.role === "super_admin" || r.role === "admin_unit" || r.role === "tim_ppdb"
    );
    if (!isAuthorized) {
      throw new ForbiddenException("Hanya admin unit yang dapat melakukan entri manual luring.");
    }
    return this.registrationsService.createOffline(req.user.id, dto);
  }

  @Post(":id/verify-payment")
  @UseGuards(ServiceJwtAuthGuard)
  async verifyPayment(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: VerifyPaymentDto
  ) {
    const roles = req.user?.roles || [];
    const isAuthorized = roles.some((r: any) =>
      r.role === "super_admin" || r.role === "admin_unit" || r.role === "tim_ppdb"
    );
    if (!isAuthorized) {
      throw new ForbiddenException("Hanya admin unit yang dapat memverifikasi pembayaran.");
    }
    return this.registrationsService.verifyPayment(id, req.user.id, dto);
  }
}
