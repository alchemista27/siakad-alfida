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
import { StrategicAuthorizationService } from './workflow/strategic-authorization.service';
import { StrategicWorkflowService } from './workflow/strategic-workflow.service';
import { StrategicWorkflowController } from './workflow/strategic-workflow.controller';
import { OrganizationSyncController } from './organization-sync/organization-sync.controller';
import { OrganizationSyncService } from './organization-sync/organization-sync.service';
import { OrganizationUsersSyncController } from './organization-sync/users.controller';
import { OrganizationUsersSyncService } from './organization-sync/users.service';
import { DepartmentMembersSyncController } from './organization-sync/department-members.controller';
import { DepartmentMembersSyncService } from './organization-sync/department-members.service';
import { StrategicNotificationService } from './notifications/strategic-notification.service';
import { StrategicNotificationController } from './notifications/strategic-notification.controller';
import { StrategicNotificationGateway } from './notifications/strategic-notification.gateway';
import { ExecutiveMonitoringService } from './executive/executive-monitoring.service';
import { ExecutiveMonitoringController } from './executive/executive-monitoring.controller';
import { ExecutiveMonitoringCron } from './executive/executive-monitoring.cron';
import { InternalServiceGuard } from './organization-sync/internal-service.guard';
import { AuthOrganizationRoleClient } from './organization-role-broker/auth-organization-role.client';
import { StrategicAccessQueryService } from './workflow/strategic-access-query.service';

@Module({
  controllers: [StrategicDepartmentController, ExecutionProgramController, ExecutionKpiController, ExecutionMilestoneController, ExecutionTaskController, ExecutionLogController, ExecutionEvidenceController, ExecutionIssueController, ExecutionMeetingController, ExecutionActionItemController, ExecutionDashboardController, ExecutionReportController, StrategicWorkflowController, OrganizationSyncController, OrganizationUsersSyncController, DepartmentMembersSyncController, StrategicNotificationController, ExecutiveMonitoringController],
  providers: [StrategicDepartmentService, ExecutionProgramService, ExecutionKpiService, ExecutionMilestoneService, ExecutionTaskService, ExecutionLogService, ExecutionEvidenceService, ExecutionIssueService, ExecutionMeetingService, ExecutionActionItemService, ExecutionDashboardService, ExecutionDashboardCron, ExecutionReportService, StrategicAuthorizationService, StrategicAccessQueryService, StrategicWorkflowService, OrganizationSyncService, OrganizationUsersSyncService, DepartmentMembersSyncService, InternalServiceGuard, AuthOrganizationRoleClient, StrategicNotificationService, StrategicNotificationGateway, ExecutiveMonitoringService, ExecutiveMonitoringCron]
})
export class StrategicModule {}
