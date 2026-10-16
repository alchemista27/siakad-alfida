import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
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
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program', 'staff')
  findAll(@Req() req: any) { return this.service.findAll(req.user); }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program', 'staff')
  findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user); }

  @Post()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pic_program', 'staff')
  create(@Body(new ZodValidationPipe(CreateExecutionLogSchema)) dto: CreateExecutionLogDto, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  @Put(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pic_program', 'staff')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionLogSchema)) dto: UpdateExecutionLogDto, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @SimakinRoles('admin_biro', 'pic_program', 'staff')
  remove(@Param('id') id: string, @Req() req: any) { return this.service.remove(id, req.user); }
}
