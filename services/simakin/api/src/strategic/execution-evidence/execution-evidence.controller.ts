import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { ExecutionEvidenceService } from './execution-evidence.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionEvidenceSchema, UpdateExecutionEvidenceSchema, CreateExecutionEvidenceDto, UpdateExecutionEvidenceDto } from '../dto/evidence.dto';
import { ServiceJwtAuthGuard } from '@alfida/auth-sdk';
import { SimakinRolesGuard, SimakinRoles } from '../../common/guards';

@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
@Controller('strategic/execution-evidences')
export class ExecutionEvidenceController {
  constructor(private readonly service: ExecutionEvidenceService) {}

  @Get()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pic_program')
  create(@Body(new ZodValidationPipe(CreateExecutionEvidenceSchema)) dto: CreateExecutionEvidenceDto, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  @Put(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pic_program')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionEvidenceSchema)) dto: UpdateExecutionEvidenceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @SimakinRoles('admin_bidang', 'admin_biro')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
