import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../src/app/(dashboard)/groups/group-staff-manager.tsx"), "utf8");
assert.match(source, /apiFetch<Employee\[\]>\("\/ymq\/roles\/participants"\)/, "Group staff UI must load canonical participants");
assert.match(source, /apiFetch\("\/ymq\/roles\/participants",[\s\S]*?method:\s*"POST"/, "Admin YMQ must be able to enroll a participant before operational assignments");
assert.match(source, /Tambah Peserta YMQ/);
assert.match(source, /!isSelectedParticipant/, "Pembina, group-admin, and roster actions must be blocked until participant enrollment exists");
assert.ok(!/\balert\s*\(/.test(source));
console.log("SIYAUM YMQ role management UI contract passed");
