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
    if (programId) return this.service.findByProgram(programId, req.user);
    return this.service.findAll(req.user); 
  }

  @Get('export/excel')
  @SimakinRoles('admin_bidang', 'pimpinan', 'pengawas')
  async exportExcel(@Query('departmentId') departmentId: string, @Req() req: any, @Res() res: Response) {
    return this.service.exportExcelByDepartment(departmentId, req.user, res);
  }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user); }

  @Post('batch-import')
  @SimakinRoles('admin_biro', 'super_admin')
  batchImport(@Body() body: { kpis: any[] }, @Req() req: any) {
    return this.service.batchImport(body.kpis, req.user);
  }

  @Post()
  @SimakinRoles('admin_biro')
  create(@Body(new ZodValidationPipe(CreateExecutionKPISchema)) dto: CreateExecutionKPIDto, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  @Put(':id')
  @SimakinRoles('admin_biro')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionKPISchema)) dto: UpdateExecutionKPIDto, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Post(':id/submit-baseline')
  @SimakinRoles('admin_biro', 'pic_program')
  submitBaseline(@Param('id') id: string, @Body(new ZodValidationPipe(SubmitBaselineSchema)) dto: SubmitBaselineDto, @Req() req: any) {
    return this.service.submitBaseline(id, dto.evidenceId, req.user);
  }

  @Post(':id/verify-baseline')
  @SimakinRoles('admin_bidang')
  verifyBaseline(@Param('id') id: string, @Req() req: any, @Body(new ZodValidationPipe(VerifyBaselineSchema)) dto: VerifyBaselineDto) {
    return this.service.verifyBaseline(id, req.user, dto.status, dto.notes as string | null);
  }

  @Delete(':id')
  @SimakinRoles('admin_bidang')
  remove(@Param('id') id: string, @Req() req: any) { return this.service.remove(id, req.user); }
}
