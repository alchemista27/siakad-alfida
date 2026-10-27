export type RoleAssignmentMigrationClient = {
  roleAssignment: {
    count(args: { where: { app: string; role: string } }): Promise<number>;
    updateMany(args: {
      where: { app: string; role: string };
      data: { role: string };
    }): Promise<unknown>;
  };
};

const legacyWhere = { app: "spmb", role: "tim_ppdb" };

export async function renameSpmbTeamRole(
  prisma: RoleAssignmentMigrationClient,
  apply: boolean,
): Promise<{ mode: "dry-run" | "apply"; affectedRoleAssignments: number }> {
  const affectedRoleAssignments = await prisma.roleAssignment.count({ where: legacyWhere });
  if (apply && affectedRoleAssignments > 0) {
    await prisma.roleAssignment.updateMany({
      where: legacyWhere,
      data: { role: "tim_spmb" },
    });
  }
  return { mode: apply ? "apply" : "dry-run", affectedRoleAssignments };
}
