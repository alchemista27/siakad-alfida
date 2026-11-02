import { PrismaClient as AuthPrisma } from "../src/generated/prisma";
import { PrismaClient as SimpegPrisma } from "../../../simpeg/api/src/generated/prisma";
import { buildUnitAdminAudit } from "./lib/unit-admin-audit";

type RequiredDatabaseUrl = "AUTH_DATABASE_URL" | "SIMPEG_DATABASE_URL";

function requiredEnv(name: RequiredDatabaseUrl): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required; pass it through the process environment only.`);
  return value;
}

async function main(): Promise<void> {
  const auth = new AuthPrisma({ datasources: { db: { url: requiredEnv("AUTH_DATABASE_URL") } } });
  const simpeg = new SimpegPrisma({ datasources: { db: { url: requiredEnv("SIMPEG_DATABASE_URL") } } });

  try {
    const [units, simpegAssignments, authAssignments, authUsers] = await Promise.all([
      simpeg.unit.findMany({ select: { id: true, name: true, code: true, category: true, isActive: true } }),
      (simpeg as any).unitAdminAssignment.findMany({ select: { unitId: true, userId: true, app: true, role: true, isActive: true } }),
      auth.roleAssignment.findMany({
        where: {
          app: "simpeg",
          role: { in: ["admin_unit", "admin_unit_nondik"] },
          user: { isActive: true },
        },
        select: { unitId: true, userId: true, app: true, role: true },
      }),
      auth.user.findMany({ select: { id: true, fullName: true, email: true, username: true, isActive: true, createdAt: true } }),
    ]);

    console.log(JSON.stringify(buildUnitAdminAudit({ units, simpegAssignments, authAssignments, authUsers }), null, 2));
  } finally {
    await Promise.all([auth.$disconnect(), simpeg.$disconnect()]);
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Unit admin audit failed.");
  process.exitCode = 1;
});
