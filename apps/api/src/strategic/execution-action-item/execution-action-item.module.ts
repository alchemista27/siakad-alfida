import { Module } from '@nestjs/common';
import { ExecutionActionItemService } from './execution-action-item.service';
import { ExecutionActionItemController } from './execution-action-item.controller';
import { ExecutionActionItemCron } from './execution-action-item.cron';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExecutionActionItemController],
  providers: [ExecutionActionItemService, ExecutionActionItemCron]
})
export class ExecutionActionItemModule {}
