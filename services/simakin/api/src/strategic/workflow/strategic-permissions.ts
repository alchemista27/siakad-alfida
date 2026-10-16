export type ScopedRole = { app?: string; role?: string; departmentId?: string | null };
export type StrategicUser = { id: string; roles?: ScopedRole[] };

export function hasScopedRole(user: StrategicUser, role: string, departmentId?: string) {
  return (user.roles ?? []).some((entry) => {
    const app = entry.app ?? "*";
    if (entry.role === "super_admin" && ["*", "auth", "core", "simakin"].includes(app)) return true;
    if (app !== "*" && app !== "simakin") return false;
    if (entry.role !== role) return false;
    return departmentId === undefined || entry.departmentId === departmentId;
  });
}

export function canActOnDepartment(
  user: StrategicUser,
  departmentId: string,
  action: "manage_biro" | "review_bidang",
  descendantDepartmentIds: string[] = [],
) {
  if (hasScopedRole(user, "super_admin")) return true;
  if (action === "manage_biro") return hasScopedRole(user, "admin_biro", departmentId);
  return hasScopedRole(user, "admin_bidang") && (
    hasScopedRole(user, "admin_bidang", departmentId) || descendantDepartmentIds.includes(departmentId)
  );
}

export function canActOnTask(user: StrategicUser, task: { assigneeId: string | null }, action: "submit") {
  return action === "submit" && task.assigneeId === user.id;
}

export function isExecutive(user: StrategicUser) {
  return hasScopedRole(user, "pimpinan") || hasScopedRole(user, "pengawas") || hasScopedRole(user, "super_admin");
}
