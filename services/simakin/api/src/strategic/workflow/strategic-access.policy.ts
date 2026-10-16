type Role = { role?: string; departmentId?: string | null; app?: string };
type User = { id: string; roles?: Role[] };
type Task = { assigneeId: string | null; departmentId: string };

export function canReadTask(user: User, task: Task) {
  const roles = user.roles ?? [];
  if (roles.some((role) => ["super_admin", "pimpinan", "pengawas"].includes(role.role ?? ""))) return true;
  if (task.assigneeId === user.id) return true;
  if (roles.some((role) => role.role === "admin_biro" && role.departmentId === task.departmentId)) return true;
  return false;
}
