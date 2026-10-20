import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { hasGlobalAdminBiro, hasScopedRole, isExecutive, StrategicUser } from "./strategic-permissions";

export type StrategicScope = { where: Record<string, unknown> };

@Injectable()
export class StrategicAccessQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async forPrograms(user: StrategicUser): Promise<StrategicScope> {
    if (isExecutive(user) || hasScopedRole(user, "super_admin") || hasGlobalAdminBiro(user)) return { where: {} };
    const departmentIds = await this.departmentIds(user);
    if (departmentIds.length) return { where: { departmentId: { in: departmentIds } } };
    return { where: { OR: [{ coordinatorId: user.id }, { userId: user.id }] } };
  }

  async forTasks(user: StrategicUser): Promise<StrategicScope> {
    if (isExecutive(user) || hasScopedRole(user, "super_admin") || hasGlobalAdminBiro(user)) return { where: {} };
    const departmentIds = await this.departmentIds(user);
    const scopes: Record<string, unknown>[] = [{ assigneeId: user.id }];
    if (departmentIds.length) scopes.push({ milestone: { program: { departmentId: { in: departmentIds } } } });
    return { where: { OR: scopes } };
  }

  async forMilestones(user: StrategicUser): Promise<StrategicScope> {
    return { where: { program: (await this.forPrograms(user)).where } };
  }

  async forMeetings(user: StrategicUser): Promise<StrategicScope> {
    const programs = await this.prisma.workProgram.findMany({ where: (await this.forPrograms(user)).where as any, select: { id: true } });
    return { where: { programId: { in: programs.map((program) => program.id) } } };
  }

  async forLogs(user: StrategicUser): Promise<StrategicScope> { return this.forTaskArtifact(user, "departmentId", "picId"); }
  async forEvidence(user: StrategicUser): Promise<StrategicScope> { return this.forTaskArtifact(user, "departmentId", "ownerId"); }
  async forIssues(user: StrategicUser): Promise<StrategicScope> { return this.forTaskArtifact(user, "departmentId", "reporterId"); }

  async forActionItems(user: StrategicUser): Promise<StrategicScope> {
    if (isExecutive(user) || hasScopedRole(user, "super_admin") || hasGlobalAdminBiro(user)) return { where: {} };
    const departmentIds = await this.departmentIds(user);
    const scopes: Record<string, unknown>[] = [{ picId: user.id }];
    if (departmentIds.length) {
      scopes.push({ issue: { departmentId: { in: departmentIds } } });
      const programs = await this.prisma.workProgram.findMany({ where: { departmentId: { in: departmentIds } }, select: { id: true } });
      if (programs.length) scopes.push({ meeting: { programId: { in: programs.map((program) => program.id) } } });
    }
    return { where: { OR: scopes } };
  }

  async assertCanReadTask(user: StrategicUser, taskId: string) {
    const task = await this.prisma.executionTask.findFirst({ where: { id: taskId, ...(await this.forTasks(user)).where } });
    if (!task) throw new NotFoundException("Tugas tidak ditemukan.");
  }

  async assertCanReadMilestone(user: StrategicUser, milestoneId: string) {
    const milestone = await this.prisma.executionMilestone.findFirst({ where: { id: milestoneId, ...(await this.forMilestones(user)).where } });
    if (!milestone) throw new NotFoundException("Milestone tidak ditemukan.");
  }

  async assertCanReadMeeting(user: StrategicUser, meetingId: string) {
    const meeting = await this.prisma.executionMeeting.findFirst({ where: { id: meetingId, ...(await this.forMeetings(user)).where } });
    if (!meeting) throw new NotFoundException("Rapat tidak ditemukan.");
  }

  async assertCanReadProgram(user: StrategicUser, programId: string) {
    const program = await this.prisma.workProgram.findFirst({ where: { id: programId, ...(await this.forPrograms(user)).where } });
    if (!program) throw new NotFoundException("Program kerja tidak ditemukan.");
  }

  async assertCanReadArtifact(user: StrategicUser, type: "log" | "evidence" | "issue", id: string) {
    const model = type === "log" ? "executionRealizationLog" : type === "evidence" ? "executionEvidence" : "executionIssue";
    const scope = type === "log" ? await this.forLogs(user) : type === "evidence" ? await this.forEvidence(user) : await this.forIssues(user);
    const item = await (this.prisma as any)[model].findFirst({ where: { id, ...scope.where } });
    if (!item) throw new NotFoundException("Artefak tidak ditemukan.");
  }

  async assertCanReadActionItem(user: StrategicUser, id: string) {
    const item = await this.prisma.executionActionItem.findFirst({ where: { id, ...(await this.forActionItems(user)).where } });
    if (!item) throw new NotFoundException("Tindak lanjut tidak ditemukan.");
  }

  private async forTaskArtifact(user: StrategicUser, departmentField: string, ownerField: string): Promise<StrategicScope> {
    if (isExecutive(user) || hasScopedRole(user, "super_admin") || hasGlobalAdminBiro(user)) return { where: {} };
    const departmentIds = await this.departmentIds(user);
    const scopes: Record<string, unknown>[] = [{ [ownerField]: user.id }, { task: { assigneeId: user.id } }];
    if (departmentIds.length) scopes.push({ [departmentField]: { in: departmentIds } });
    return { where: { OR: scopes } };
  }

  private async departmentIds(user: StrategicUser) {
    const roles = user.roles ?? [];
    const biros = roles.filter((role) => role.role === "admin_biro" && role.departmentId).map((role) => role.departmentId as string);
    const bidangs = roles.filter((role) => role.role === "admin_bidang" && role.departmentId).map((role) => role.departmentId as string);
    if (!bidangs.length) return biros;
    const descendants = await this.prisma.department.findMany({ where: { parentId: { in: bidangs } }, select: { id: true } });
    return [...new Set([...biros, ...bidangs, ...descendants.map((item) => item.id)])];
  }
}
