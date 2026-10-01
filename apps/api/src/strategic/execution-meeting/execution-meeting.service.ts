import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExecutionMeetingDto, UpdateExecutionMeetingDto, CreateMeetingAttendanceDto } from '../dto/meeting.dto';

@Injectable()
export class ExecutionMeetingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateExecutionMeetingDto) {
    return this.prisma.executionMeeting.create({ 
      data: createDto
    });
  }

  async findAll() {
    return this.prisma.executionMeeting.findMany({
      include: {
        attendances: true,
        actionItems: true,
      },
      orderBy: { meetingDate: 'desc' }
    });
  }

  async findOne(id: string) {
    const meeting = await this.prisma.executionMeeting.findUnique({
      where: { id },
      include: {
        attendances: {
          include: {
            user: { select: { id: true, fullName: true } }
          }
        },
        actionItems: true,
      },
    });
    if (!meeting) throw new NotFoundException(`Meeting with ID ${id} not found`);
    return meeting;
  }

  async update(id: string, updateDto: UpdateExecutionMeetingDto) {
    await this.findOne(id);
    
    return this.prisma.executionMeeting.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.executionMeeting.delete({ where: { id } });
  }

  async addAttendance(meetingId: string, attendanceDto: CreateMeetingAttendanceDto) {
    return this.prisma.meetingAttendance.create({
      data: {
        ...attendanceDto,
        meetingId
      }
    });
  }
}
