import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ExecutionMeetingService } from './execution-meeting.service';
import { CreateExecutionMeetingDto, UpdateExecutionMeetingDto, CreateMeetingAttendanceDto } from '../dto/meeting.dto';
import { ServiceJwtAuthGuard } from '@alfida/auth-sdk';
import { SimakinRolesGuard, SimakinRoles } from '../../common/guards';

@Controller('strategic/execution-meetings')
@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
export class ExecutionMeetingController {
  constructor(private readonly service: ExecutionMeetingService) {}

  @Post()
  @SimakinRoles('admin_bidang', 'admin_biro')
  create(@Body() createDto: CreateExecutionMeetingDto, @Req() req: any) {
    return this.service.create(createDto, req.user);
  }

  @Get()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findAll(@Req() req: any) {
    return this.service.findAll(req.user);
  }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user);
  }

  @Patch(':id')
  @SimakinRoles('admin_bidang', 'admin_biro')
  update(@Param('id') id: string, @Body() updateDto: UpdateExecutionMeetingDto, @Req() req: any) {
    return this.service.update(id, updateDto, req.user);
  }

  @Delete(':id')
  @SimakinRoles('admin_bidang', 'admin_biro')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user);
  }

  @Post(':id/attendance')
  @SimakinRoles('admin_bidang', 'admin_biro')
  addAttendance(@Param('id') id: string, @Body() attendanceDto: CreateMeetingAttendanceDto, @Req() req: any) {
    return this.service.addAttendance(id, attendanceDto, req.user);
  }
}
