import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ExecutionIssueService } from './execution-issue.service';
import { CreateExecutionIssueDto, UpdateExecutionIssueDto } from '../dto/issue.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('strategic/execution-issues')
@UseGuards(JwtAuthGuard)
export class ExecutionIssueController {
  constructor(private readonly service: ExecutionIssueService) {}

  @Post()
  create(@Body() createDto: CreateExecutionIssueDto) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateExecutionIssueDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
