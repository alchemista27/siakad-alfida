import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { StrategicDepartmentService } from './strategic-department.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateDepartmentSchema, UpdateDepartmentSchema, CreateDepartmentDto, UpdateDepartmentDto } from '../dto/department.dto';
import { ServiceJwtAuthGuard } from '@alfida/auth-sdk';
import { SimakinRolesGuard, SimakinRoles } from '../../common/guards';

@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
@Controller('strategic/departments')
export class StrategicDepartmentController {
  constructor(private readonly service: StrategicDepartmentService) {}

  @Get()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findAll() { return this.service.findAll(); }

  @Get('my-members')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas')
  getMyMembers(@Req() req: any) {
    return this.service.getMyMembers(req.user);
  }

  @Get('my-subdepartments')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas')
  getMySubdepartments(@Req() req: any) {
    return this.service.getMySubdepartments(req.user);
  }

  @Post('subdepartment')
  @SimakinRoles('admin_bidang', 'admin_biro')
  createSubdepartment(@Body() data: any, @Req() req: any) {
    return this.service.createSubdepartment(data, req.user);
  }

  @Post(':id/members')
  @SimakinRoles('admin_bidang')
  addMember(@Param('id') id: string, @Body() data: { userId: string; role?: string }, @Req() req: any) {
    return this.service.addMember(id, data.userId, data.role, req.user);
  }

  @Delete(':id/members/:userId')
  @SimakinRoles('admin_bidang')
  removeMember(@Param('id') id: string, @Param('userId') userId: string, @Req() req: any) {
    return this.service.removeMember(id, userId, req.user);
  }

  @Get('overview')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas')
  getDepartmentOverview() { return this.service.getDepartmentOverview(); }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @SimakinRoles('admin_bidang')
  create(@Body(new ZodValidationPipe(CreateDepartmentSchema)) dto: CreateDepartmentDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @SimakinRoles('admin_bidang')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateDepartmentSchema)) dto: UpdateDepartmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @SimakinRoles('admin_bidang')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
