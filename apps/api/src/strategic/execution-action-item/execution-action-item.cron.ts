import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExecutionActionItemCron {
  private readonly logger = new Logger(ExecutionActionItemCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async handleCron() {
    this.logger.debug('Running daily Action Item reminder check...');
    
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    // Find incomplete action items deadline is tomorrow or overdue
    const pendingItems = await this.prisma.executionActionItem.findMany({
      where: {
        status: { not: 'completed' },
        deadline: { lte: tomorrow }
      },
      include: {
        pic: { select: { id: true, email: true, fullName: true } }
      }
    });

    for (const item of pendingItems) {
      if (!item.pic) continue;
      
      const isOverdue = item.deadline && item.deadline < now;
      
      this.logger.log(
        `[NOTIFICATION] To: ${item.pic.email} - Action Item "${item.description}" is ${
          isOverdue ? 'OVERDUE' : 'DUE TOMORROW'
        }.`
      );
      
      // Real implementation would send an email or push notification here
      // this.mailService.sendActionItemReminder(item.pic.email, item);
    }
    
    this.logger.debug(`Found ${pendingItems.length} items needing reminders.`);
  }
}
