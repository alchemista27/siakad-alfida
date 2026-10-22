import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const relativePath = "src/app/(dashboard)/groups/group-staff-manager.tsx";
const target = path.join(root, relativePath);
assert.ok(existsSync(target), `Expected ${relativePath} to exist`);
const source = readFileSync(target, "utf8");

assert.match(source, /SIMPEG|employee projection|proyeksi pegawai/i);
assert.match(source, /\/ymq\/employees/);
assert.match(source, /\/groups\/\$\{groupId\}\/pembina/);
assert.match(source, /\/groups\/\$\{groupId\}\/admins/);
assert.match(source, /"PUT"/);
assert.match(source, /"DELETE"/);
assert.match(source, /active|aktif/i);
assert.match(source, /unit/i);
assert.match(source, /assignment|penugasan/i);
assert.match(source, /NotificationModal/);
assert.ok(!/\balert\s*\(/.test(source), "Group manager must not use alert()");
assert.ok(!/\bconfirm\s*\(/.test(source), "Group manager must not use confirm()");

console.log("SIYAUM YMQ group staff UI contract passed");
