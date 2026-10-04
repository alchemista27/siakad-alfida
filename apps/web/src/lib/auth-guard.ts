import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserRole } from "@sim/database";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export interface UserRoleInfo {
  role: UserRole;
  unitId: string | null;
}

import { cache } from 'react';

export const requireAuth = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  // Get Prisma user with roles
  const prismaUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { roles: true },
  });

  if (!prismaUser || !prismaUser.isActive) {
    // Session is valid in Better Auth but user profile is missing or inactive
    // Clear session cookies and redirect
    redirect("/login");
  }

  return prismaUser;
});

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  const roles = user.roles || [];
  
  // Super admin bypasses role checks
  const isSuperAdmin = roles.some((r) => r.role === UserRole.super_admin);
  if (isSuperAdmin) return user;

  const hasRole = roles.some((r) => allowedRoles.includes(r.role));

  if (!hasRole) {
    redirect("/403");
  }
  return user;
}

export async function requireUnitAccess(unitId: string) {
  const user = await requireAuth();
  const roles = user.roles || [];
  const isSuperAdmin = roles.some((r) => r.role === UserRole.super_admin);
  if (isSuperAdmin) return user;

  const hasUnitAccess = roles.some((r) => r.unitId === unitId);
  if (!hasUnitAccess) {
    redirect("/403");
  }
  return user;
}
