import { Controller, Get, Post, Body, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { CorrespondencesService } from './correspondences.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/secretariat/correspondences')
@UseGuards(JwtAuthGuard)
export class CorrespondencesController {
  constructor(private readonly correspondencesService: CorrespondencesService) {}

  @Get()
  async findAll() {
    return this.correspondencesService.findAll();
  }

  @Get('my-dispositions')
  async getMyDispositions(@Req() req: any) {
    if (!req.user?.id) return [];
    return this.correspondencesService.getMyDispositions(req.user.id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.correspondencesService.create(data);
  }

  @Post(':id/dispositions')
  async addDisposition(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.correspondencesService.addDisposition(id, {
      ...data,
      senderId: req.user?.id,
    });
  }

  @Patch('dispositions/:id/complete')
  async completeDisposition(@Param('id') id: string, @Req() req: any) {
    return this.correspondencesService.completeDisposition(id, req.user?.id);
  }
}
