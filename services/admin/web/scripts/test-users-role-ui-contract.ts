import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const page = readFileSync(resolve(process.cwd(), "src/app/users/page.tsx"), "utf8");
const roleModal = readFileSync(resolve(process.cwd(), "src/components/user-role-modal.tsx"), "utf8");
const confirmModal = readFileSync(resolve(process.cwd(), "src/components/confirm-action-modal.tsx"), "utf8");
const source = `${page}\n${roleModal}\n${confirmModal}`;

assert.match(source, /Kelola Peran/);
assert.match(source, /\/api\/admin\/users\/\$\{user\.id\}\/roles[\s\S]*method:\s*"POST"/);
assert.match(source, /\/api\/admin\/users\/roles\/\$\{assignment\.id\}[\s\S]*method:\s*"DELETE"/);
assert.match(source, /organization-roles/);
assert.match(source, /departmentId/);
assert.match(page, /onClick=\{\(\) => setRoleUser\(u\)\}/);
assert.match(page, /\{roleUser && <UserRoleModal/);
assert.doesNotMatch(page, /\balert\(/);
assert.doesNotMatch(page, /\bconfirm\(/);
assert.match(confirmModal, /Escape/);

console.log("Admin users role UI contract passed");
