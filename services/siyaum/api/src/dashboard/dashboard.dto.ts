export class YmqDashboardQueryDto {
  from: string;
  to: string;
  unitId?: string;
  groupId?: string;
  pembinaUserId?: string;
  level?: "pra_tahsin" | "tahsin" | "tahfiz";
}
