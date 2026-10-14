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
  create(@Body() createDto: CreateExecutionActionItemDto) {
    return this.service.create(createDto);
  }

  @Get()
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findAll() {
    return this.service.findAll();
  }

  @Get('me')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findMyTasks(@Request() req: any) {
    return this.service.findByPic(req.user.id);
  }

  @Get(':id')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pimpinan', 'pengawas', 'pic_program')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  @SimakinRoles('admin_bidang', 'admin_biro', 'pic_program')
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateExecutionActionItemDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @SimakinRoles('admin_bidang', 'admin_biro')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
