
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { StrategicDepartmentService } from './strategic-department.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateDepartmentSchema, UpdateDepartmentSchema, CreateDepartmentDto, UpdateDepartmentDto } from '../dto/department.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('strategic/departments')
export class StrategicDepartmentController {
  constructor(private readonly service: StrategicDepartmentService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get('my-members')
  getMyMembers(@Req() req: any) {
    return this.service.getMyMembers(req.user);
  }

  @Get('my-subdepartments')
  getMySubdepartments(@Req() req: any) {
    return this.service.getMySubdepartments(req.user);
  }

  @Post('subdepartment')
  createSubdepartment(@Body() data: any, @Req() req: any) {
    return this.service.createSubdepartment(data, req.user);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() data: { userId: string; role?: string }, @Req() req: any) {
    return this.service.addMember(id, data.userId, data.role, req.user);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string, @Req() req: any) {
    return this.service.removeMember(id, userId, req.user);
  }

  @Get('overview')
  getDepartmentOverview() { return this.service.getDepartmentOverview(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body(new ZodValidationPipe(CreateDepartmentSchema)) dto: CreateDepartmentDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateDepartmentSchema)) dto: UpdateDepartmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
