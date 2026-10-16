import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ExecutionIssueService } from './execution-issue.service';
import { CreateExecutionIssueDto, UpdateExecutionIssueDto } from '../dto/issue.dto';
import { ServiceJwtAuthGuard } from '@alfida/auth-sdk';
import { SimakinRolesGuard, SimakinRoles } from '../../common/guards';

@Controller('strategic/execution-issues')
@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
export class ExecutionIssueController {
  constructor(private readonly service: ExecutionIssueService) {}

  @Post()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pic_program', 'staff')
  create(@Body() createDto: CreateExecutionIssueDto, @Req() req: any) {
    return this.service.create(createDto, req.user);
  }

  @Get()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program', 'staff')
  findAll(@Req() req: any) {
    return this.service.findAll(req.user);
  }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program', 'staff')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user);
  }

  @Patch(':id')
  @SimakinRoles('admin_biro', 'pic_program', 'staff')
  update(@Param('id') id: string, @Body() updateDto: UpdateExecutionIssueDto, @Req() req: any) {
    return this.service.update(id, updateDto, req.user);
  }

  @Delete(':id')
  @SimakinRoles('admin_biro', 'pic_program', 'staff')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user);
  }
}
