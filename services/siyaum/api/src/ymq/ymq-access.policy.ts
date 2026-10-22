export interface YmqRoleScope {
  app?: string | null;
  role: string;
}

export interface YmqPrincipal {
  id: string;
  roles: YmqRoleScope[];
}

export interface YmqGroupScope {
  id: string;
  pembinaUserId: string | null;
  groupAdmins: Array<{ userId: string; revokedAt: Date | string | null }>;
}

export interface YmqReadableGroupScope extends YmqGroupScope {
  members: Array<{ userId: string }>;
}

export function hasYmqRole(principal: YmqPrincipal | undefined, role: string): boolean {
  if (!principal?.roles) return false;
  return principal.roles.some((assignment) => {
    const app = assignment.app ?? "*";
    if (assignment.role === "super_admin" && (app === "*" || app === "auth" || app === "core")) return true;
    return (app === "siyaum" || app === "*") && assignment.role === role;
  });
}

export function hasAnyYmqRole(principal: YmqPrincipal | undefined, roles: readonly string[]): boolean {
  return roles.some((role) => hasYmqRole(principal, role));
}

export function canManageGroup(principal: YmqPrincipal, group: YmqGroupScope): boolean {
  if (hasYmqRole(principal, "admin_ymq")) return true;
  if (hasYmqRole(principal, "pembina_ymq") && group.pembinaUserId === principal.id) return true;
  return hasYmqRole(principal, "admin_kelompok") && group.groupAdmins.some(
    (assignment) => assignment.userId === principal.id && assignment.revokedAt === null,
  );
}

export function canReadExecutiveDashboard(principal: YmqPrincipal): boolean {
  return hasAnyYmqRole(principal, ["admin_ymq", "pengawas", "pimpinan"]);
}

export function canReadGroup(principal: YmqPrincipal, group: YmqReadableGroupScope): boolean {
  if (canManageGroup(principal, group) || hasAnyYmqRole(principal, ["pengawas", "pimpinan"])) return true;
  return hasYmqRole(principal, "peserta") && group.members.some((member) => member.userId === principal.id);
}

export function canReadOwnMembership(principal: YmqPrincipal, memberUserId: string): boolean {
  return hasYmqRole(principal, "admin_ymq") || principal.id === memberUserId;
}
