
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExecutionKpiService } from './execution-kpi.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionKPISchema, UpdateExecutionKPISchema, CreateExecutionKPIDto, UpdateExecutionKPIDto, SubmitBaselineSchema, SubmitBaselineDto, VerifyBaselineSchema, VerifyBaselineDto } from '../dto/kpi.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('strategic/kpis')
export class ExecutionKpiController {
  constructor(private readonly service: ExecutionKpiService) {}

  @Get()
  findAll(@Req() req: any, @Query('programId') programId?: string) { 
    if (programId) return this.service.findByProgram(programId); // Might need filtering here too, but normally program is filtered earlier
    return this.service.findAll(req.user); 
  }

  @Get('export/excel')
  async exportExcel(@Query('departmentId') departmentId: string, @Res() res: Response) {
    return this.service.exportExcelByDepartment(departmentId, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body(new ZodValidationPipe(CreateExecutionKPISchema)) dto: CreateExecutionKPIDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionKPISchema)) dto: UpdateExecutionKPIDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/submit-baseline')
  submitBaseline(@Param('id') id: string, @Body(new ZodValidationPipe(SubmitBaselineSchema)) dto: SubmitBaselineDto) {
    return this.service.submitBaseline(id, dto.evidenceId);
  }

  @Post(':id/verify-baseline')
  verifyBaseline(@Param('id') id: string, @Req() req: any, @Body(new ZodValidationPipe(VerifyBaselineSchema)) dto: VerifyBaselineDto) {
    return this.service.verifyBaseline(id, req.user?.id || 'system', dto.status, dto.notes as string | null);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
