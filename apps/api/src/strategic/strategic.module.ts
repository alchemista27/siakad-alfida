import { Module } from '@nestjs/common';
import { ExecutionProgramController } from './execution-program/execution-program.controller';
import { ExecutionProgramService } from './execution-program/execution-program.service';
import { ExecutionKpiController } from './execution-kpi/execution-kpi.controller';
import { ExecutionKpiService } from './execution-kpi/execution-kpi.service';
import { ExecutionMilestoneController } from './execution-milestone/execution-milestone.controller';
import { ExecutionMilestoneService } from './execution-milestone/execution-milestone.service';
import { ExecutionTaskController } from './execution-task/execution-task.controller';
import { ExecutionTaskService } from './execution-task/execution-task.service';
import { ExecutionLogController } from './execution-log/execution-log.controller';
import { ExecutionLogService } from './execution-log/execution-log.service';
import { ExecutionEvidenceController } from './execution-evidence/execution-evidence.controller';
import { ExecutionEvidenceService } from './execution-evidence/execution-evidence.service';
import { ExecutionIssueController } from './execution-issue/execution-issue.controller';
import { ExecutionIssueService } from './execution-issue/execution-issue.service';
import { ExecutionMeetingController } from './execution-meeting/execution-meeting.controller';
import { ExecutionMeetingService } from './execution-meeting/execution-meeting.service';
import { ExecutionActionItemController } from './execution-action-item/execution-action-item.controller';
import { ExecutionActionItemService } from './execution-action-item/execution-action-item.service';
import { ExecutionDashboardController } from './execution-dashboard/execution-dashboard.controller';
import { ExecutionDashboardService } from './execution-dashboard/execution-dashboard.service';
import { ExecutionDashboardCron } from './execution-dashboard/execution-dashboard.cron';
import { ExecutionReportController } from './execution-report/execution-report.controller';
import { ExecutionReportService } from './execution-report/execution-report.service';

import { StrategicDepartmentController } from './strategic-department/strategic-department.controller';
import { StrategicDepartmentService } from './strategic-department/strategic-department.service';

@Module({
  controllers: [StrategicDepartmentController, ExecutionProgramController, ExecutionKpiController, ExecutionMilestoneController, ExecutionTaskController, ExecutionLogController, ExecutionEvidenceController, ExecutionIssueController, ExecutionMeetingController, ExecutionActionItemController, ExecutionDashboardController, ExecutionReportController],
  providers: [StrategicDepartmentService, ExecutionProgramService, ExecutionKpiService, ExecutionMilestoneService, ExecutionTaskService, ExecutionLogService, ExecutionEvidenceService, ExecutionIssueService, ExecutionMeetingService, ExecutionActionItemService, ExecutionDashboardService, ExecutionDashboardCron, ExecutionReportService]
})
export class StrategicModule {}
