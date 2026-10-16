import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExecutionActionItemDto, UpdateExecutionActionItemDto } from '../dto/action-item.dto';
import { StrategicAccessQueryService } from '../workflow/strategic-access-query.service';
import { StrategicAuthorizationService } from '../workflow/strategic-authorization.service';
import { hasScopedRole } from '../workflow/strategic-permissions';

@Injectable()
export class ExecutionActionItemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: StrategicAccessQueryService,
    private readonly authorization: StrategicAuthorizationService,
  ) {}

  async create(createDto: CreateExecutionActionItemDto, user: any) {
    const db = this.prisma as any;
    const [meeting, issue] = await Promise.all([
      createDto.meetingId ? db.executionMeeting.findUnique({ where: { id: createDto.meetingId } }) : null,
      createDto.issueId ? db.executionIssue.findUnique({ where: { id: createDto.issueId }, select: { departmentId: true } }) : null,
    ]);
    const meetingProgram = meeting?.programId ? await this.prisma.workProgram.findUnique({ where: { id: meeting.programId }, select: { departmentId: true } }) : null;
    const meetingDepartmentId = meeting?.program?.departmentId ?? meetingProgram?.departmentId;
    const issueDepartmentId = issue?.departmentId;
    if (createDto.meetingId && !meetingDepartmentId) throw new BadRequestException('Rapat harus terkait dengan program kerja dalam scope.');
    if (createDto.issueId && !issueDepartmentId) throw new BadRequestException('Kendala tidak ditemukan.');
    if (!meetingDepartmentId && !issueDepartmentId) throw new BadRequestException('Tindak lanjut harus terkait dengan rapat atau kendala.');
    if (meetingDepartmentId && issueDepartmentId && meetingDepartmentId !== issueDepartmentId) throw new BadRequestException('Rapat dan kendala harus berasal dari Biro yang sama.');
    const departmentId = meetingDepartmentId ?? issueDepartmentId!;
    await this.assertCanManageDepartment(user, departmentId);
    if (createDto.picId) {
      const member = await db.departmentMember.findFirst({ where: { userId: createDto.picId, departmentId } });
      const admin = member ? null : await db.departmentAdmin.findFirst({ where: { userId: createDto.picId, departmentId } });
      if (!member && !admin) throw new BadRequestException('PIC harus merupakan anggota Biro tindak lanjut.');
    }
    return this.prisma.executionActionItem.create({
      data: createDto,
    });
  }

  private async assertCanManageDepartment(user: any, departmentId: string) {
    if (hasScopedRole(user, 'super_admin') || hasScopedRole(user, 'admin_biro', departmentId)) return;
    await this.authorization.assertBidangCanReview(user, departmentId);
  }

  async findAll(user: any) {
    return this.prisma.executionActionItem.findMany({
      where: (await this.access.forActionItems(user)).where as any,
      include: {
        pic: { select: { id: true, fullName: true } },
        meeting: { select: { id: true, title: true } },
        issue: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPic(picId: string) {
    return this.prisma.executionActionItem.findMany({
      where: { picId },
      include: {
        meeting: { select: { id: true, title: true } },
        issue: { select: { id: true, title: true } },
      },
      orderBy: { deadline: 'asc' },
    });
  }

  async findOne(id: string, user: any) {
    await this.access.assertCanReadActionItem(user, id);
    const item = await this.prisma.executionActionItem.findUnique({
      where: { id },
      include: {
        pic: { select: { id: true, fullName: true } },
        meeting: true,
        issue: true,
      },
    });
    if (!item) throw new NotFoundException(`Action Item with ID ${id} not found`);
    return item;
  }

  async update(id: string, updateDto: UpdateExecutionActionItemDto, user: any) {
    const item = await this.findOne(id, user);
    const data = item.picId === user.id ? { status: updateDto.status } : updateDto;
    return this.prisma.executionActionItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);
    return this.prisma.executionActionItem.delete({
      where: { id },
    });
  }
}
