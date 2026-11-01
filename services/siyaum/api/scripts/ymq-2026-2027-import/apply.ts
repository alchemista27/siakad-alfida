import { PrismaClient, YmqProgressLevel } from "../../src/generated/prisma";
import type { PlannedAuthAccount } from "./account-plan";
import { syncYmqAuthProjectionUsers } from "./auth-projection";
import type { AuthRosterDirectoryUser } from "./auth-roster-broker";
import type { YmqImportPlan } from "./plan";

export async function applyYmqImport(
  prisma: PrismaClient,
  plan: YmqImportPlan,
  directory: AuthRosterDirectoryUser[],
  accounts: PlannedAuthAccount[],
): Promise<{ groups: number; members: number; projectionSync: { created: number; updated: number; unchanged: number } }> {
  if (plan.blockingIssues.length) throw new Error("Import tidak dapat diterapkan karena masih memiliki blocking issues.");

  const projectionSync = await syncYmqAuthProjectionUsers(prisma, directory, accounts);
  await prisma.$transaction(async (tx) => {
    const groupIds = new Map<string, string>();
    for (const group of plan.groups) {
      const persisted = await tx.ymqGroup.upsert({
        where: { sourceKey: group.sourceKey },
        create: {
          sourceKey: group.sourceKey,
          name: group.name,
          pembinaUserId: group.pembina.id,
          unitId: group.unit.id,
          unitName: group.unit.name,
          level: null,
        },
        update: {
          name: group.name,
          pembinaUserId: group.pembina.id,
          unitId: group.unit.id,
          unitName: group.unit.name,
          level: null,
        },
        select: { id: true },
      });
      groupIds.set(group.sourceKey, persisted.id);
    }

    const participantIds = [...new Set(plan.groups.flatMap((group) => group.members.map((member) => member.id)))];
    const existingActiveMemberships = await tx.ymqMember.findMany({
      where: { userId: { in: participantIds }, leftAt: null },
      select: { userId: true, groupId: true },
    });
    const existingGroupByParticipant = new Map(existingActiveMemberships.map((membership) => [membership.userId, membership.groupId]));

    for (const group of plan.groups) {
      const groupId = groupIds.get(group.sourceKey);
      if (!groupId) throw new Error(`Group source key tidak ditemukan setelah upsert: ${group.sourceKey}`);
      for (const member of group.members) {
        const existingGroupId = existingGroupByParticipant.get(member.id);
        if (existingGroupId && existingGroupId !== groupId) {
          throw new Error(`Peserta ${member.fullName} sudah memiliki membership aktif di group lain; import tidak memindahkan data manual.`);
        }
        await tx.ymqMember.upsert({
          where: { groupId_userId: { groupId, userId: member.id } },
          create: { groupId, userId: member.id, progressLevel: member.progressLevel as YmqProgressLevel },
          update: { leftAt: null, progressLevel: member.progressLevel as YmqProgressLevel },
        });
      }
    }
  });

  return {
    groups: plan.groups.length,
    members: plan.groups.reduce((total, group) => total + group.members.length, 0),
    projectionSync,
  };
}
