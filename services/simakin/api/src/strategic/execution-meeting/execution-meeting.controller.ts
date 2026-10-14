import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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
  create(@Body() createDto: CreateExecutionMeetingDto) {
    return this.service.create(createDto);
  }

  @Get()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @SimakinRoles('admin_bidang', 'admin_biro')
  update(@Param('id') id: string, @Body() updateDto: UpdateExecutionMeetingDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @SimakinRoles('admin_bidang', 'admin_biro')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/attendance')
  @SimakinRoles('admin_bidang', 'admin_biro')
  addAttendance(@Param('id') id: string, @Body() attendanceDto: CreateMeetingAttendanceDto) {
    return this.service.addAttendance(id, attendanceDto);
  }
}
