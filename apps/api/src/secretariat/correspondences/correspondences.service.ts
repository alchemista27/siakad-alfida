import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../common/notifications/notifications.service';

@Injectable()
export class CorrespondencesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async findAll() {
    return this.prisma.correspondence.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        dispositions: {
          include: { assignee: true, sender: true }
        }
      }
    });
  }

  async create(data: {
    type: string;
    referenceNumber: string;
    date: Date;
    sender: string;
    recipient: string;
    subject: string;
  }) {
    return this.prisma.correspondence.create({
      data: {
        type: data.type,
        referenceNumber: data.referenceNumber,
        date: new Date(data.date),
        sender: data.sender,
        recipient: data.recipient,
        subject: data.subject,
      }
    });
  }

  async addDisposition(correspondenceId: string, data: {
    assigneeId: string;
    senderId: string;
    instructions: string;
    dueDate?: Date;
  }) {
    const disposition = await this.prisma.correspondenceDisposition.create({
      data: {
        correspondenceId,
        assigneeId: data.assigneeId,
        senderId: data.senderId,
        instructions: data.instructions,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: { correspondence: true }
    });

    // Notify assignee
    await this.notificationsService.createNotification({
      userId: data.assigneeId,
      title: 'Disposisi Surat Baru',
      message: `Anda mendapat disposisi surat baru: ${disposition.correspondence.subject}`,
      linkUrl: `/execution/correspondence`,
    });

    return disposition;
  }

  async getMyDispositions(userId: string) {
    return this.prisma.correspondenceDisposition.findMany({
      where: { assigneeId: userId },
      include: {
        correspondence: true,
        sender: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async completeDisposition(id: string, userId: string) {
    return this.prisma.correspondenceDisposition.updateMany({
      where: { id, assigneeId: userId },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });
  }
}
