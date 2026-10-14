import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExecutionKpiService } from './execution-kpi.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionKPISchema, UpdateExecutionKPISchema, CreateExecutionKPIDto, UpdateExecutionKPIDto, SubmitBaselineSchema, SubmitBaselineDto, VerifyBaselineSchema, VerifyBaselineDto } from '../dto/kpi.dto';
import { ServiceJwtAuthGuard } from '@alfida/auth-sdk';
import { SimakinRolesGuard, SimakinRoles } from '../../common/guards';

@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
@Controller('strategic/kpis')
export class ExecutionKpiController {
  constructor(private readonly service: ExecutionKpiService) {}

  @Get()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findAll(@Req() req: any, @Query('programId') programId?: string) { 
    if (programId) return this.service.findByProgram(programId);
    return this.service.findAll(req.user); 
  }

  @Get('export/excel')
  @SimakinRoles('admin_bidang', 'pimpinan', 'pengawas')
  async exportExcel(@Query('departmentId') departmentId: string, @Res() res: Response) {
    return this.service.exportExcelByDepartment(departmentId, res);
  }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post('batch-import')
  @SimakinRoles('admin_bidang')
  batchImport(@Body() body: { kpis: any[] }, @Req() req: any) {
    return this.service.batchImport(body.kpis, req.user);
  }

  @Post()
  @SimakinRoles('admin_bidang')
  create(@Body(new ZodValidationPipe(CreateExecutionKPISchema)) dto: CreateExecutionKPIDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @SimakinRoles('admin_bidang')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionKPISchema)) dto: UpdateExecutionKPIDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/submit-baseline')
  @SimakinRoles('admin_biro', 'pic_program')
  submitBaseline(@Param('id') id: string, @Body(new ZodValidationPipe(SubmitBaselineSchema)) dto: SubmitBaselineDto) {
    return this.service.submitBaseline(id, dto.evidenceId);
  }

  @Post(':id/verify-baseline')
  @SimakinRoles('admin_bidang')
  verifyBaseline(@Param('id') id: string, @Req() req: any, @Body(new ZodValidationPipe(VerifyBaselineSchema)) dto: VerifyBaselineDto) {
    return this.service.verifyBaseline(id, req.user?.id || 'system', dto.status, dto.notes as string | null);
  }

  @Delete(':id')
  @SimakinRoles('admin_bidang')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
