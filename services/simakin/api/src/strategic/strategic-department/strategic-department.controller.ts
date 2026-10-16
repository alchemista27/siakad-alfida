import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { StrategicDepartmentService } from './strategic-department.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateBureauDto, CreateBureauSchema } from '../dto/bureau.dto';
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

  @Post(':bidangId/bureaus')
  @SimakinRoles('admin_bidang')
  createBureau(@Param('bidangId') bidangId: string, @Body(new ZodValidationPipe(CreateBureauSchema)) dto: CreateBureauDto, @Req() req: any) { return this.service.createBureau(bidangId, dto, req.user); }

  @Post(':biroId/admins')
  @SimakinRoles('admin_bidang')
  assignBureauAdmin(@Param('biroId') biroId: string, @Body() body: { userId: string }, @Req() req: any) { return this.service.assignBureauAdmin(biroId, body.userId, req.user); }

  @Delete(':biroId/admins/:userId')
  @SimakinRoles('admin_bidang')
  removeBureauAdmin(@Param('biroId') biroId: string, @Param('userId') userId: string, @Req() req: any) { return this.service.removeBureauAdmin(biroId, userId, req.user); }

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

}
