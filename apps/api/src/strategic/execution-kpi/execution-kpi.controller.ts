
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ExecutionKpiService } from './execution-kpi.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionKPISchema, UpdateExecutionKPISchema, CreateExecutionKPIDto, UpdateExecutionKPIDto } from '../dto/kpi.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('strategic/kpis')
export class ExecutionKpiController {
  constructor(private readonly service: ExecutionKpiService) {}

  @Get()
  findAll(@Req() req: any, @Query('programId') programId?: string) { 
    if (programId) return this.service.findByProgram(programId); // Might need filtering here too, but normally program is filtered earlier
    return this.service.findAll(req.user); 
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body(new ZodValidationPipe(CreateExecutionKPISchema)) dto: CreateExecutionKPIDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionKPISchema)) dto: UpdateExecutionKPIDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
