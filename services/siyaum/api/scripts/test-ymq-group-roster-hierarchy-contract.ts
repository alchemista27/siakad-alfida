import assert from "node:assert/strict";
import { GroupsService } from "../src/groups/groups.service";

const groups = [
  {
    id: "3",
    name: "Badriah — LAZIS Alfida",
    unitName: "LAZIS Alfida",
    pembina: { id: "p1", fullName: "Badriah", email: "b@example.test" },
    groupAdmins: [],
    members: [],
    _count: { members: 0 },
  },
  {
    id: "2",
    name: "Anisa — SDIT Iqra 1",
    unitName: "SD Islam Terpadu Iqra 1",
    pembina: { id: "p2", fullName: "Anisa", email: "a@example.test" },
    groupAdmins: [],
    members: [],
    _count: { members: 0 },
  },
  {
    id: "1",
    name: "Badriah — SDIT Iqra 1",
    unitName: "SD Islam Terpadu Iqra 1",
    pembina: { id: "p1", fullName: "Badriah", email: "b@example.test" },
    groupAdmins: [],
    members: [],
    _count: { members: 0 },
  },
];

let findOneArgs: unknown;
const prisma = {
  ymqGroup: {
    findMany: async () => groups,
    findUnique: async (args: unknown) => {
      findOneArgs = args;
      return {
        ...groups[0],
        groupAdmins: [{
          userId: "group-admin-user",
          revokedAt: null,
          user: {
            id: "group-admin-user",
            fullName: "Admin Kelompok",
            email: "admin-kelompok@example.test",
            unitId: "unit-1",
            unitName: "LAZIS Alfida",
          },
        }],
        members: [{
          id: "member-1",
          userId: "member-user",
          progressLevel: "tahsin",
          user: {
            id: "member-user",
            fullName: "Peserta",
            email: "peserta@example.test",
            unitId: null,
            unitName: null,
          },
        }],
      };
    },
  },
};
const roleBroker = { list: async () => [], assign: async () => ({ changed: false }), revoke: async () => undefined };
const service = new GroupsService(prisma as any, roleBroker as any);
const admin = { id: "admin", roles: [{ app: "siyaum", role: "admin_ymq" }] };

async function main() {
  const ordered = await service.findAll(admin);
  assert.deepEqual(ordered.map((group) => group.id), ["2", "3", "1"]);

  const detail = await service.findOne("3", admin);
  assert.equal(detail.members[0].progressLevel, "tahsin");
  assert.deepEqual(detail.groupAdmins[0], {
    userId: "group-admin-user",
    revokedAt: null,
    user: {
      id: "group-admin-user",
      fullName: "Admin Kelompok",
      email: "admin-kelompok@example.test",
      unitId: "unit-1",
      unitName: "LAZIS Alfida",
    },
  });

  const include = (findOneArgs as {
    include: {
      groupAdmins: {
        select: {
          userId: boolean;
          revokedAt: boolean;
          user?: { select: Record<string, boolean> };
        };
      };
      members: unknown;
    };
  }).include;
  assert.deepEqual(include.groupAdmins.select.user, {
    select: { id: true, fullName: true, email: true, unitId: true, unitName: true },
  });
  assert.match(JSON.stringify(include.members), /progressLevel/);

  console.log("YMQ group roster hierarchy contract passed");
}

void main();
