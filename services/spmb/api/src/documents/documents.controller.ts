import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SpmbRoles, SpmbRolesGuard } from "../common/guards";
import { type SpmbPrincipal } from "../common/spmb-scope-policy";
import { DocumentsService } from "./documents.service";
import { PresignUploadDto, UpsertDocumentDto } from "./documents.dto";

@Controller("documents")
@UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post("presign")
  @SpmbRoles("orang_tua")
  async presign(
    @Req() req: { user: SpmbPrincipal },
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: PresignUploadDto,
  ) {
    return this.documentsService.presignUpload(req.user.id, dto);
  }

  @Post("upsert")
  @SpmbRoles("orang_tua")
  async upsert(
    @Req() req: { user: SpmbPrincipal },
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) dto: UpsertDocumentDto,
  ) {
    return this.documentsService.upsertDocument(req.user.id, dto);
  }

  @Post(":id/download-url")
  @SpmbRoles("orang_tua", "admin_unit", "tim_ppdb")
  async downloadUrl(@Param("id") id: string, @Req() req: { user: SpmbPrincipal }) {
    return this.documentsService.createDownloadUrl(id, req.user);
  }

  @Post("finalize/:regId")
  @SpmbRoles("orang_tua")
  async finalize(@Param("regId") regId: string, @Req() req: { user: SpmbPrincipal }) {
    return this.documentsService.finalizeDocuments(regId, req.user.id);
  }

  @Post("medical-done/:regId")
  @SpmbRoles("orang_tua")
  async markMedicalDone(@Param("regId") regId: string, @Req() req: { user: SpmbPrincipal }) {
    return this.documentsService.markMedicalDone(regId, req.user.id);
  }
}
