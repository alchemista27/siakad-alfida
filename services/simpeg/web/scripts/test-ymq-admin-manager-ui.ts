import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (relative: string) => {
  const target = resolve(root, relative);
  assert.ok(existsSync(target), `Expected ${relative} to exist`);
  return readFileSync(target, "utf8");
};

const page = read("src/app/page.tsx");
const manager = read("src/components/ymq/ymq-admin-manager.tsx");

assert.match(page, /type SimpegTab =[\s\S]*?"ymq"/, "SIMPEG must register a YMQ tab");
assert.match(page, /const \[canManageYmqAdmins, setCanManageYmqAdmins\] = useState\(false\)/);
assert.match(page, /role === "super_admin" && \["\*", "auth", "core", "simpeg"\]/);
assert.match(page, /canManageYmqAdmins \? \[\{/);
assert.match(page, /activeTab === "ymq" && canManageYmqAdmins/);
assert.doesNotMatch(page, /admin_kepegawaian[^\n]*setCanManageYmqAdmins/);

assert.match(manager, /\/api\/ymq\/roles\/admins/);
assert.match(manager, /\/api\/employees\/suggestions\?search=/);
assert.match(manager, /ConfirmActionModal/);
assert.ok(!/\balert\s*\(/.test(manager), "YMQ manager must not use alert()");
assert.ok(!/\bconfirm\s*\(/.test(manager), "YMQ manager must use the project confirmation modal");
assert.match(manager, /Admin YMQ/);

console.log("SIMPEG YMQ admin manager UI contract passed");
