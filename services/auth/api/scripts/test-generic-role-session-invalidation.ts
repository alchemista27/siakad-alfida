import assert from "node:assert/strict";
import { UsersService } from "../src/users/users.service";

const userId = "11111111-1111-4111-8111-111111111111";
const roleAssignmentId = "22222222-2222-4222-8222-222222222222";
const invalidatedUserIds: string[] = [];

const prisma: any = {
  user: {
    async findUnique({ where }: any) {
      assert.equal(where.id, userId);
      return { id: userId, isActive: true };
    },
  },
  roleAssignment: {
    async create({ data }: any) {
      assert.equal(data.userId, userId);
      return { id: roleAssignmentId, ...data };
    },
    async delete({ where }: any) {
      assert.equal(where.id, roleAssignmentId);
      return { id: roleAssignmentId, userId };
    },
  },
  session: {
    async deleteMany({ where }: any) {
      invalidatedUserIds.push(where.userId);
      return { count: 1 };
    },
  },
};

async function main() {
  const service = new UsersService(prisma);
  await service.assignRole(userId, { app: "*", role: "super_admin" });
  assert.deepEqual(invalidatedUserIds, [userId], "assigning a role must invalidate role-bearing sessions");

  invalidatedUserIds.length = 0;
  await service.revokeRole(roleAssignmentId);
  assert.deepEqual(invalidatedUserIds, [userId], "revoking a role must invalidate role-bearing sessions");

  console.log("Auth generic role session invalidation contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
