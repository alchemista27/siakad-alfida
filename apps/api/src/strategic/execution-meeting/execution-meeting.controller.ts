import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ExecutionMeetingService } from './execution-meeting.service';
import { CreateExecutionMeetingDto, UpdateExecutionMeetingDto, CreateMeetingAttendanceDto } from '../dto/meeting.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('strategic/execution-meetings')
@UseGuards(JwtAuthGuard)
export class ExecutionMeetingController {
  constructor(private readonly service: ExecutionMeetingService) {}

  @Post()
  create(@Body() createDto: CreateExecutionMeetingDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateExecutionMeetingDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/attendance')
  addAttendance(@Param('id') id: string, @Body() attendanceDto: CreateMeetingAttendanceDto) {
    return this.service.addAttendance(id, attendanceDto);
  }
}
