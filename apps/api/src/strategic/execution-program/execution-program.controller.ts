
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { ExecutionProgramService } from './execution-program.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionProgramSchema, UpdateExecutionProgramSchema, CreateExecutionProgramDto, UpdateExecutionProgramDto } from '../dto/program.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('strategic/programs')
export class ExecutionProgramController {
  constructor(private readonly service: ExecutionProgramService) {}

  @Get()
  findAll(@Req() req: any) { return this.service.findAll(req.user); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body(new ZodValidationPipe(CreateExecutionProgramSchema)) dto: CreateExecutionProgramDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionProgramSchema)) dto: UpdateExecutionProgramDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
