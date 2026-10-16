import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { ExecutionMilestoneService } from './execution-milestone.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionMilestoneSchema, UpdateExecutionMilestoneSchema, CreateExecutionMilestoneDto, UpdateExecutionMilestoneDto } from '../dto/milestone.dto';
import { ServiceJwtAuthGuard } from '@alfida/auth-sdk';
import { SimakinRolesGuard, SimakinRoles } from '../../common/guards';

@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
@Controller('strategic/execution-milestones')
export class ExecutionMilestoneController {
  constructor(private readonly service: ExecutionMilestoneService) {}

  @Get()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findAll(@Req() req: any) { return this.service.findAll(req.user); }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user); }

  @Post()
  @SimakinRoles('admin_biro')
  create(@Body(new ZodValidationPipe(CreateExecutionMilestoneSchema)) dto: CreateExecutionMilestoneDto, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  @Put(':id')
  @SimakinRoles('admin_biro')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionMilestoneSchema)) dto: UpdateExecutionMilestoneDto, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @SimakinRoles('admin_bidang', 'admin_biro')
  remove(@Param('id') id: string, @Req() req: any) { return this.service.remove(id, req.user); }
}
