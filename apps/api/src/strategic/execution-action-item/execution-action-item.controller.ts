import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ExecutionActionItemService } from './execution-action-item.service';
import { CreateExecutionActionItemDto, UpdateExecutionActionItemDto } from '../dto/action-item.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('strategic/execution-action-items')
@UseGuards(JwtAuthGuard)
export class ExecutionActionItemController {
  constructor(private readonly service: ExecutionActionItemService) {}

  @Post()
  create(@Body() createDto: CreateExecutionActionItemDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('me')
  findMyTasks(@Request() req) {
    return this.service.findByPic(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateExecutionActionItemDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
