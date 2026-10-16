import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ExecutionActionItemService } from './execution-action-item.service';
import { CreateExecutionActionItemDto, UpdateExecutionActionItemDto } from '../dto/action-item.dto';
import { ServiceJwtAuthGuard } from '@alfida/auth-sdk';
import { SimakinRolesGuard, SimakinRoles } from '../../common/guards';

@Controller('strategic/execution-action-items')
@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
export class ExecutionActionItemController {
  constructor(private readonly service: ExecutionActionItemService) {}

  @Post()
  @SimakinRoles('admin_bidang', 'admin_biro')
  create(@Body() createDto: CreateExecutionActionItemDto, @Request() req: any) {
    return this.service.create(createDto, req.user);
  }

  @Get()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findAll(@Request() req: any) {
    return this.service.findAll(req.user);
  }

  @Get('me')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findMyTasks(@Request() req: any) {
    return this.service.findByPic(req.user.id);
  }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.service.findOne(id, req.user);
  }

  @Patch(':id/status')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pic_program')
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateExecutionActionItemDto, @Request() req: any) {
    return this.service.update(id, updateDto, req.user);
  }

  @Delete(':id')
  @SimakinRoles('admin_bidang', 'admin_biro')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.service.remove(id, req.user);
  }
}
