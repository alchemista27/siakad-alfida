import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExecutionMeetingDto, UpdateExecutionMeetingDto, CreateMeetingAttendanceDto } from '../dto/meeting.dto';
import { StrategicAuthorizationService } from '../workflow/strategic-authorization.service';
import { StrategicAccessQueryService } from '../workflow/strategic-access-query.service';

@Injectable()
export class ExecutionMeetingService {
  constructor(private readonly prisma: PrismaService, private readonly authorization: StrategicAuthorizationService, private readonly access: StrategicAccessQueryService) {}

  async create(createDto: CreateExecutionMeetingDto, user: any) {
    if (!createDto.programId) throw new BadRequestException('Rapat harus terkait dengan program kerja.');
    const program = await this.prisma.workProgram.findUnique({ where: { id: createDto.programId } });
    if (!program) throw new NotFoundException('Program kerja tidak ditemukan.');
    await this.authorization.assertBiroCanManage(user, program.departmentId);
    const { organizerId, ...safe } = createDto;
    return this.prisma.executionMeeting.create({ 
      data: { ...safe, organizerId: user.id }
    });
  }

  async findAll(user: any) {
    return this.prisma.executionMeeting.findMany({
      where: (await this.access.forMeetings(user)).where as any,
      include: {
        attendances: true,
        actionItems: true,
      },
      orderBy: { meetingDate: 'desc' }
    });
  }

  async findOne(id: string, user: any) {
    await this.access.assertCanReadMeeting(user, id);
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

  async update(id: string, updateDto: UpdateExecutionMeetingDto, user: any) {
    const meeting = await this.prisma.executionMeeting.findUnique({ where: { id } });
    const program = meeting?.programId ? await this.prisma.workProgram.findUnique({ where: { id: meeting.programId } }) : null;
    if (!program) throw new NotFoundException('Rapat tidak ditemukan atau tidak memiliki program kerja.');
    await this.authorization.assertBiroCanManage(user, program.departmentId);
    
    return this.prisma.executionMeeting.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string, user: any) {
    const meeting = await this.prisma.executionMeeting.findUnique({ where: { id } });
    const program = meeting?.programId ? await this.prisma.workProgram.findUnique({ where: { id: meeting.programId } }) : null;
    if (!program) throw new NotFoundException('Rapat tidak ditemukan atau tidak memiliki program kerja.');
    await this.authorization.assertBiroCanManage(user, program.departmentId);
    return this.prisma.executionMeeting.delete({ where: { id } });
  }

  async addAttendance(meetingId: string, attendanceDto: CreateMeetingAttendanceDto, user: any) {
    const meeting = await this.prisma.executionMeeting.findUnique({ where: { id: meetingId } });
    const program = meeting?.programId ? await this.prisma.workProgram.findUnique({ where: { id: meeting.programId } }) : null;
    if (!program) throw new NotFoundException('Rapat tidak ditemukan atau tidak memiliki program kerja.');
    await this.authorization.assertBiroCanManage(user, program.departmentId);
    return this.prisma.meetingAttendance.create({
      data: {
        ...attendanceDto,
        meetingId
      }
    });
  }
}
