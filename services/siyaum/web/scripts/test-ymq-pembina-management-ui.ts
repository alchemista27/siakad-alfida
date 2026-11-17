import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve(import.meta.dirname, "../src/app/(dashboard)/pembina/pembina-assignment-manager.tsx");
assert.ok(existsSync(target), "Dedicated Pembina assignment manager must exist");
const source = readFileSync(target, "utf8");

assert.match(source, /apiFetch<Group\[\]>\("\/groups"\)/);
assert.match(source, /\/groups\/\$\{groupId\}\/pembina/);
assert.match(source, /Tetapkan Pembina/);
assert.match(source, /Cabut Pembina/);
assert.match(source, /Tambah Peserta YMQ/);
assert.match(source, /NotificationModal/);
assert.ok(!/\balert\s*\(/.test(source));
assert.ok(!/\bconfirm\s*\(/.test(source));

console.log("SIYAUM YMQ pembina management UI contract passed");
