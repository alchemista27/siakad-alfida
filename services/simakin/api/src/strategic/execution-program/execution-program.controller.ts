import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { ExecutionProgramService } from './execution-program.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionProgramSchema, UpdateExecutionProgramSchema, CreateExecutionProgramDto, UpdateExecutionProgramDto } from '../dto/program.dto';
import { ServiceJwtAuthGuard } from '@alfida/auth-sdk';
import { SimakinRolesGuard, SimakinRoles } from '../../common/guards';

@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
@Controller('strategic/programs')
export class ExecutionProgramController {
  constructor(private readonly service: ExecutionProgramService) {}

  @Get()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findAll(@Req() req: any) { return this.service.findAll(req.user); }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user); }

  @Post()
  @SimakinRoles('admin_biro', 'super_admin')
  create(@Body(new ZodValidationPipe(CreateExecutionProgramSchema)) dto: CreateExecutionProgramDto, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  @Post('batch-import')
  @SimakinRoles('admin_bidang', 'admin_biro')
  batchImport(@Body() body: { programs: any[] }, @Req() req: any) {
    return this.service.batchImport(body.programs, req.user);
  }

  @Put(':id')
  @SimakinRoles('admin_bidang', 'admin_biro')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionProgramSchema)) dto: UpdateExecutionProgramDto, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @SimakinRoles('admin_bidang', 'admin_biro')
  remove(@Param('id') id: string, @Req() req: any) { return this.service.remove(id, req.user); }
}
