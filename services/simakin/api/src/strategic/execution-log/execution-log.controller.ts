import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ExecutionLogService } from './execution-log.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionLogSchema, UpdateExecutionLogSchema, CreateExecutionLogDto, UpdateExecutionLogDto } from '../dto/log.dto';
import { ServiceJwtAuthGuard } from '@alfida/auth-sdk';
import { SimakinRolesGuard, SimakinRoles } from '../../common/guards';

@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
@Controller('strategic/execution-logs')
export class ExecutionLogController {
  constructor(private readonly service: ExecutionLogService) {}

  @Get()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pic_program')
  create(@Body(new ZodValidationPipe(CreateExecutionLogSchema)) dto: CreateExecutionLogDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pic_program')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionLogSchema)) dto: UpdateExecutionLogDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @SimakinRoles('admin_bidang', 'admin_biro')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
