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

@Controller("documents")
@UseGuards(ServiceJwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post("presign")
  async presign(@Req() req: any, @Body() dto: PresignUploadDto) {
    return this.documentsService.presignUpload(req.user.id, dto);
  }

  @Post("upsert")
  async upsert(@Req() req: any, @Body() dto: UpsertDocumentDto) {
    return this.documentsService.upsertDocument(req.user.id, dto);
  }

  @Post("finalize/:regId")
  async finalize(@Param("regId") regId: string, @Req() req: any) {
    return this.documentsService.finalizeDocuments(regId, req.user.id);
  }

  @Post("medical-done/:regId")
  async markMedicalDone(@Param("regId") regId: string, @Req() req: any) {
    return this.documentsService.markMedicalDone(regId, req.user.id);
  }
}
