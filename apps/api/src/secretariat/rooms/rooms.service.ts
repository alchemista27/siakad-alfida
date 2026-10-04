import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findAllRooms() {
    return this.prisma.facilityRoom.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getBookings(startDate?: Date, endDate?: Date) {
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      };
    }

    return this.prisma.roomBooking.findMany({
      where: dateFilter,
      include: {
        room: true,
        booker: { select: { fullName: true, id: true } },
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });
  }

  async bookRoom(data: {
    roomId: string;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    purpose?: string;
    bookerId: string;
  }) {
    // Basic double booking validation
    const targetDate = new Date(data.date);
    const existingBookings = await this.prisma.roomBooking.findMany({
      where: {
        roomId: data.roomId,
        date: targetDate,
        status: 'approved',
      }
    });

    // Simple time overlap check
    const isConflict = existingBookings.some(booking => {
      // If the new booking starts before the existing one ends AND ends after the existing one starts
      return (data.startTime < booking.endTime && data.endTime > booking.startTime);
    });

    if (isConflict) {
      throw new BadRequestException('Ruangan sudah di-booking pada rentang waktu tersebut.');
    }

    return this.prisma.roomBooking.create({
      data: {
        roomId: data.roomId,
        title: data.title,
        date: targetDate,
        startTime: data.startTime,
        endTime: data.endTime,
        purpose: data.purpose,
        bookerId: data.bookerId,
        status: 'approved', // auto approve for now
      }
    });
  }
}
