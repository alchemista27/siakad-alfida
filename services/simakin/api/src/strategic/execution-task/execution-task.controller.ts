import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { ExecutionTaskService } from './execution-task.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionTaskSchema, UpdateExecutionTaskSchema, CreateExecutionTaskDto, UpdateExecutionTaskDto } from '../dto/task.dto';
import { ServiceJwtAuthGuard } from '@alfida/auth-sdk';
import { SimakinRolesGuard, SimakinRoles } from '../../common/guards';

@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
@Controller('strategic/execution-tasks')
export class ExecutionTaskController {
  constructor(private readonly service: ExecutionTaskService) {}

  @Get()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program', 'staff')
  findAll(@Req() req: any) { return this.service.findAll(req.user); }

  @Get('me')
  @SimakinRoles('staff', 'pic_program', 'admin_biro', 'admin_bidang')
  findMine(@Req() req: any) { return this.service.findMine(req.user); }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program', 'staff')
  findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user); }

  @Post()
  @SimakinRoles('admin_biro')
  create(@Body(new ZodValidationPipe(CreateExecutionTaskSchema)) dto: CreateExecutionTaskDto, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  @Put(':id')
  @SimakinRoles('admin_biro')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionTaskSchema)) dto: UpdateExecutionTaskDto, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @SimakinRoles('admin_bidang', 'admin_biro')
  remove(@Param('id') id: string, @Req() req: any) { return this.service.remove(id, req.user); }
}
