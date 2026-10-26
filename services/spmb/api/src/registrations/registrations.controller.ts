import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ValidationPipe,
} from "@nestjs/common";
import { RegistrationsService } from "./registrations.service";
import {
  CreateOnlineRegistrationDto,
  SubmitStudentDataDto,
  SubmitParentDataDto,
  UploadPaymentDto,
  VerifyPaymentDto,
  ReviewDossierDto,
  FinalizePaymentProofDto,
  PresignPaymentProofDto,
} from "./registrations.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SpmbRolesGuard, SpmbRoles } from "../common/guards";
import { RegistrationSource, RegistrationStatus } from "../generated/prisma";
import { PaymentProofStorageService } from "./payment-proof-storage.service";

@Controller("registrations")
export class RegistrationsController {
  constructor(
    private readonly registrationsService: RegistrationsService,
    private readonly paymentProofStorageService: PaymentProofStorageService,
  ) {}

  // ================= TRACKING ORANG TUA =================
  @Get("track/:regNum")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async trackByNumber(@Param("regNum") regNum: string, @Req() req: any) {
    return this.registrationsService.trackByNumber(regNum, req.user.id);
  }

  // ================= ORANG TUA =================
  @Get("parent")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async listForParent(@Req() req: any) {
    return this.registrationsService.listForParent(req.user.id);
  }

  @Get("parent/active")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async getActiveRegistration(@Req() req: any) {
    return this.registrationsService.getActiveRegistrationForParent(req.user.id);
  }

  @Get("parent/:id")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async getForParent(@Param("id") id: string, @Req() req: any) {
    return this.registrationsService.getForParent(id, req.user.id);
  }

  @Post("online")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async createOnline(
    @Req() req: any,
    @Body() dto: CreateOnlineRegistrationDto
  ) {
    return this.registrationsService.createOnline(req.user, dto);
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

  @Post(":id/payment-proof/presign")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async presignPaymentProof(
    @Param("id") id: string,
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: PresignPaymentProofDto,
  ) {
    return this.paymentProofStorageService.presignUpload(id, req.user.id, dto);
  }

  @Post(":id/payment-proof/finalize")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async finalizePaymentProof(
    @Param("id") id: string,
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: FinalizePaymentProofDto,
  ) {
    return this.paymentProofStorageService.finalizeUpload(id, req.user.id, dto);
  }

  @Post(":id/payment-proof/download-url")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua", "admin_unit", "tim_ppdb")
  async paymentProofDownloadUrl(@Param("id") id: string, @Req() req: any) {
    return this.paymentProofStorageService.createDownloadUrl(id, req.user);
  }

  @Post(":id/verify-documents")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async verifyDocuments(
    @Param("id") id: string,
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) body: ReviewDossierDto
  ) {
    return this.registrationsService.verifyDocuments(id, req.user, body.isApproved, body.rejectionNote);
  }

  // ================= ADMIN UNIT / TIM PPDB =================
  @Get()
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async findAll(
    @Req() req: any,
    @Query("periodId") periodId?: string,
    @Query("status") status?: RegistrationStatus,
    @Query("source") source?: RegistrationSource,
    @Query("search") search?: string
  ) {
    return this.registrationsService.findAll({ periodId, status, source, search }, req.user);
  }

  @Get(":id")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async findOne(@Param("id") id: string, @Req() req: any) {
    return this.registrationsService.findOne(id, req.user);
  }


  @Post(":id/verify-payment")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async verifyPayment(
    @Param("id") id: string,
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) dto: VerifyPaymentDto
  ) {
    return this.registrationsService.verifyPayment(id, req.user, dto);
  }
}
