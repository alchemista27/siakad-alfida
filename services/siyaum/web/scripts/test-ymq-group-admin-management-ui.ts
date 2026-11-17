import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => {
  const target = resolve(root, relativePath);
  assert.ok(existsSync(target), `Expected ${relativePath} to exist`);
  return readFileSync(target, "utf8");
};

const page = read("src/app/(dashboard)/group-admins/page.tsx");
const manager = read("src/app/(dashboard)/group-admins/group-admin-assignment-manager.tsx");
assert.match(page, /GroupAdminAssignmentManager/);
assert.match(manager, /apiFetch<Group\[\]>\("\/groups"\)/);
assert.match(manager, /apiFetch<GroupDetail>\(`\/groups\/\$\{id\}`\)/);
assert.match(manager, /selectedGroup\?\.members/);
assert.match(manager, /\/groups\/\$\{groupId\}\/admins/);
assert.match(manager, /NotificationModal/);
assert.match(manager, /anggota roster aktif/i);
assert.doesNotMatch(manager, /\/ymq\/employees\/assignable/);
assert.doesNotMatch(manager, /\b(alert|confirm)\(/);

console.log("SIYAUM YMQ group admin management UI contract passed");
