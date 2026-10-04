import { Controller, Get, Post, Body, Req, Query, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/secretariat/rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async getRooms() {
    return this.roomsService.findAllRooms();
  }

  @Get('bookings')
  async getBookings(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.roomsService.getBookings(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('book')
  async bookRoom(@Body() data: any, @Req() req: any) {
    return this.roomsService.bookRoom({
      ...data,
      bookerId: req.user?.id,
    });
  }
}
