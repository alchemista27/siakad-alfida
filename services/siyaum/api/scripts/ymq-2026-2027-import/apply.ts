import { PrismaClient, YmqProgressLevel } from "../../src/generated/prisma";
import type { YmqImportPlan } from "./plan";
import { syncYmqProjectionUsers, type SimpegYmqProjection } from "./projection";

export type RoleBroker = {
  assign(actorUserId: string, userId: string, role: "peserta" | "pembina_ymq"): Promise<{ changed: boolean }>;
  revoke(actorUserId: string, userId: string, role: "peserta" | "pembina_ymq"): Promise<void>;
};

type GrantedRole = { userId: string; role: "peserta" | "pembina_ymq" };

export async function applyYmqImport(
  prisma: PrismaClient,
  roleBroker: RoleBroker,
  actorUserId: string,
  plan: YmqImportPlan,
  projections: SimpegYmqProjection[],
): Promise<{ groups: number; members: number; roleGrants: number; projectionSync: { received: number; created: number; updated: number; ignoredOlder: number } }> {
  if (plan.blockingIssues.length) throw new Error("Import tidak dapat diterapkan karena masih memiliki blocking issues.");

  const projectionSync = await syncYmqProjectionUsers(prisma, projections);
  const grantedRoles: GrantedRole[] = [];
  try {
    for (const group of plan.groups) {
      await grant(roleBroker, actorUserId, group.pembina.id, "pembina_ymq", grantedRoles);
      for (const member of group.members) await grant(roleBroker, actorUserId, member.id, "peserta", grantedRoles);
    }

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
  } catch (error) {
    await compensate(roleBroker, actorUserId, grantedRoles);
    throw error;
  }

  return {
    groups: plan.groups.length,
    members: plan.groups.reduce((total, group) => total + group.members.length, 0),
    roleGrants: grantedRoles.length,
    projectionSync,
  };
}

export function createAuthRoleBroker(fetchImplementation: typeof fetch = fetch): RoleBroker {
  const baseUrl = process.env.AUTH_INTERNAL_API_URL?.trim();
  const secret = process.env.INTERNAL_SERVICE_SECRET?.trim();
  if (!baseUrl || !secret) throw new Error("AUTH_INTERNAL_API_URL dan INTERNAL_SERVICE_SECRET wajib tersedia untuk perubahan role YMQ.");

  async function request(path: string, init: RequestInit): Promise<{ changed?: boolean }> {
    const response = await fetchImplementation(new URL(path, baseUrl), {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        "x-internal-service-key": secret,
      },
      signal: AbortSignal.timeout(10_000),
    });
    const payload = await response.json().catch(() => null) as { changed?: boolean } | null;
    if (!response.ok || !payload) throw new Error("Role broker Auth menolak perubahan role YMQ.");
    return payload;
  }

  return {
    async assign(actorUserId, userId, role) {
      const payload = await request("/api/internal/ymq-role-broker/assign", { method: "POST", body: JSON.stringify({ actorUserId, userId, role }) });
      if (typeof payload.changed !== "boolean") throw new Error("Role broker Auth mengembalikan respons role yang tidak valid.");
      return { changed: payload.changed };
    },
    async revoke(actorUserId, userId, role) {
      await request(`/api/internal/ymq-role-broker/users/${encodeURIComponent(userId)}/roles/${role}`, { method: "DELETE", body: JSON.stringify({ actorUserId }) });
    },
  };
}

async function grant(roleBroker: RoleBroker, actorUserId: string, userId: string, role: GrantedRole["role"], grantedRoles: GrantedRole[]) {
  const result = await roleBroker.assign(actorUserId, userId, role);
  if (result.changed) grantedRoles.push({ userId, role });
}

async function compensate(roleBroker: RoleBroker, actorUserId: string, grantedRoles: GrantedRole[]) {
  for (const grant of [...grantedRoles].reverse()) {
    try {
      await roleBroker.revoke(actorUserId, grant.userId, grant.role);
    } catch {
      // A failed compensation is surfaced by the original import failure without exposing internal transport details.
    }
  }
}
