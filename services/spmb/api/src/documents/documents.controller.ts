import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { PresignUploadDto, UpsertDocumentDto } from "./documents.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SpmbRolesGuard, SpmbRoles } from "../common/guards";

@Controller("documents")
@UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post("presign")
  @SpmbRoles("orang_tua", "admin_unit", "tim_ppdb")
  async presign(@Req() req: any, @Body() dto: PresignUploadDto) {
    return this.documentsService.presignUpload(req.user.id, dto);
  }

  @Post("upsert")
  @SpmbRoles("orang_tua", "admin_unit", "tim_ppdb")
  async upsert(@Req() req: any, @Body() dto: UpsertDocumentDto) {
    return this.documentsService.upsertDocument(req.user.id, dto);
  }

  @Post("finalize/:regId")
  @SpmbRoles("orang_tua", "admin_unit", "tim_ppdb")
  async finalize(@Param("regId") regId: string, @Req() req: any) {
    return this.documentsService.finalizeDocuments(regId, req.user.id);
  }

  @Post("medical-done/:regId")
  @SpmbRoles("orang_tua", "admin_unit", "tim_ppdb")
  async markMedicalDone(@Param("regId") regId: string, @Req() req: any) {
    return this.documentsService.markMedicalDone(regId, req.user.id);
  }
}
