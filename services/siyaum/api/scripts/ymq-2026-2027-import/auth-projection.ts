import type { PrismaClient } from "../../src/generated/prisma";
import type { PlannedAuthAccount } from "./account-plan";
import type { AuthRosterDirectoryUser } from "./auth-roster-broker";

export async function syncYmqAuthProjectionUsers(
  prisma: Pick<PrismaClient, "user">,
  directory: AuthRosterDirectoryUser[],
  accounts: PlannedAuthAccount[],
): Promise<{ created: number; updated: number; unchanged: number }> {
  const accountsByEmail = new Map(accounts.map((account) => [account.email.toLowerCase(), account]));
  const counts = { created: 0, updated: 0, unchanged: 0 };

  for (const entry of directory) {
    const account = accountsByEmail.get(entry.email.toLowerCase());
    if (!account) throw new Error("Directory Auth tidak dapat dipetakan ke account plan YMQ.");
    const unitIds = [...new Set(account.assignments
      .filter((assignment): assignment is Extract<typeof assignment, { app: "simpeg"; role: "pegawai" }> => assignment.app === "simpeg" && assignment.role === "pegawai")
      .map((assignment) => assignment.unitId))];
    const sourceUpdatedAt = new Date(entry.sourceUpdatedAt);
    const data = {
      fullName: entry.fullName,
      email: entry.email,
      isActive: entry.isActive,
      sourceUpdatedAt,
      unitId: unitIds.length === 1 ? unitIds[0] : null,
      unitName: null,
    };
    const existing = await prisma.user.findUnique({ where: { id: entry.id }, select: { sourceUpdatedAt: true } });
    if (existing?.sourceUpdatedAt && sourceUpdatedAt.getTime() <= existing.sourceUpdatedAt.getTime()) {
      counts.unchanged += 1;
    } else if (existing) {
      await prisma.user.update({ where: { id: entry.id }, data });
      counts.updated += 1;
    } else {
      await prisma.user.create({ data: { id: entry.id, ...data } });
      counts.created += 1;
    }
  }
  return counts;
}
