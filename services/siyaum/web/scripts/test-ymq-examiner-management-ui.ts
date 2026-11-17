import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve(import.meta.dirname, "../src/app/(dashboard)/penguji/examiner-assignment-manager.tsx");
assert.ok(existsSync(target), "Dedicated Penguji assignment manager must exist");
const source = readFileSync(target, "utf8");

assert.match(source, /\/examiner-assignments/);
assert.match(source, /academicYear/);
assert.match(source, /Ikhwan/);
assert.match(source, /Akhwat/);
assert.match(source, /Target Penugasan/);
assert.match(source, /Pembina YMQ/);
assert.match(source, /Peserta per Unit/);
assert.match(source, /NotificationModal/);
assert.ok(!/\balert\s*\(/.test(source));
assert.ok(!/\bconfirm\s*\(/.test(source));

console.log("SIYAUM YMQ examiner management UI contract passed");
