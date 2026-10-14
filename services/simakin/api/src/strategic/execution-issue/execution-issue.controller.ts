import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ExecutionIssueService } from './execution-issue.service';
import { CreateExecutionIssueDto, UpdateExecutionIssueDto } from '../dto/issue.dto';
import { ServiceJwtAuthGuard } from '@alfida/auth-sdk';
import { SimakinRolesGuard, SimakinRoles } from '../../common/guards';

@Controller('strategic/execution-issues')
@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
export class ExecutionIssueController {
  constructor(private readonly service: ExecutionIssueService) {}

  @Post()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pic_program')
  create(@Body() createDto: CreateExecutionIssueDto) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateExecutionIssueDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @SimakinRoles('admin_bidang')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
